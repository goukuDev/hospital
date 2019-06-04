const electron = require('electron')
const electronPDFWindow = require('electron-pdf-window')
const path = require("path")
const fs = require("fs")
const promise = require("bluebird")
const rp = require('request-promise')
const nodeCmd = require('node-cmd')
const jsBarcode = require('jsbarcode')
const log4js = require('log4js')
const log4js_config = require("./logConf.json");
const app = electron.app
const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow
const session = electron.session
const main_window = getConfig()['server']
var jwt = undefined

log4js.configure(log4js_config);
const logger = log4js.getLogger()

var printer_device_name = "Generic 36BW-8SeriesPCL"
var barcode_device_name = "ZDesigner GT800 (EPL)"

app.on('window-all-closed', function(){
    if (process.platform != 'darwin'){
        app.quit()
    }
})

app.on('ready', function() {
    getServerWindow()
})

function getServerWindow(){
    mainWindow = new BrowserWindow({
        width: 1920, 
        height: 1080, 
        // frame: false,
        // resizable: false,
        autoHideMenuBar: true,
        // fullscreen: true,
        // titleBarStyle: 'hidden',
        webPreferences: {
            javascript: true,
            plugins: true,
            nodeIntegration: false, // 不集成 Nodejs
            webSecurity: false,
            preload: path.join(__dirname, 'public', 'renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
        }
    })

    mainWindow.loadURL(main_window)
    // mainWindow.openDevTools()

    mainWindow.on('closed', function(){  
        mainWindow = null
    })

    ipcMain.on('print', function(event, arg){
        session.defaultSession.cookies.get({}, async function(error, cookies) {
            if(error) throw error
            jwt = cookies[0].value

            if (arg.message_type == 'report'){
                logger.info('print report')
                logger.info(arg)
                let type = arg.type
                let pathnum = arg.pathnum
                let pdf_path = path.join(path.resolve(__dirname), '../../temp', 'print.pdf')
                report_data = await get_report_content(pathnum, type)
                pis_apply_id = JSON.parse(report_data).data.pis_apply_id
                report_content = JSON.parse(report_data).data.content
                apply_data = await get_apply_content(pis_apply_id)
                apply_content = JSON.parse(apply_data).data
                if(type == 0){
                    let modify_date = 0
                    let report = undefined
                    report_content.report.forEach(function(_report){
                        if (_report.modifyDate && new Date(_report.modifyDate).getTime() > modify_date){
                            report = _report
                            modify_date = new Date(_report.modifyDate).getTime()
                        }
                    })
                    if(report.type == 'reg'){
                        await write_reg_report(apply_content, report, report_content.common, pathnum)
                        html_path = path.join(path.resolve(__dirname), '../../temp', 'reg.html')
                        logger.info(`html_path: ${html_path}`)
                    }
                    else if(report.type == 'lung'){
                        await get_lung_report(apply_content, report, report_content.common, pathnum)
                        html_path = path.join(path.resolve(__dirname), '../../temp', 'lung.html')
                    }
                }
                else{
                    report = reports[0]
                }
                print(html_path)
    
                // let wkhtmltopdf = path.join(path.resolve(__dirname), 'wkhtmltopdf', 'bin', 'wkhtmltopdf')
                // let wkhtmltopdf_cmd = wkhtmltopdf + ' ' + html_path + ' ' + pdf_path
                // await nodeCmd.run(wkhtmltopdf_cmd)
                // nodeCmd.get(wkhtmltopdf_cmd, function(err, data, stderr){
                //     wait_pdf(pdf_path)
                // })
                
            }
            else if(arg.message_type == 'apply'){
                let pis_apply_id = arg.pis_apply_id
                let pathnum = arg.pathnum
                data = await get_apply_content(pis_apply_id)
                content = JSON.parse(data).data
                await write_apply(content, pathnum)
                print(path.join(path.resolve(__dirname), '../../temp', 'apply.html'))
            }
            else if(arg.message_type == 'barcode'){
                print_barcode(path.join(path.resolve(__dirname), '../../temp', 'barcode.html'))
            }
        })
    })
}

async function wait_pdf(pdf_path){
    if(fs.existsSync(pdf_path)){
        console.log('create pdf success')
        print_to_pdf(pdf_path)
    }
    else{
        setTimeout(wait_pdf(pdf_path, html_path), 60*1000)
    }
}


function getConfig(){
    let config_path = path.join(path.resolve(__dirname, '../..'), "app.config")
    let return_config = JSON.parse(fs.readFileSync(config_path))
    if(!('server' in return_config)){
        return_config['server'] = 'http://183.134.198.230:9090'
    }
    return return_config
}

function print(html_path){
    logger.info('print in')
    let windowOptions = {
        width: 500,
        height: 500,
        show: false
    }
    print_window = new BrowserWindow(windowOptions);
    print_window.loadURL(html_path)
    let printers = print_window.webContents.getPrinters()
    printer_device_name = printers[0].name
    printers.forEach(print => {
        logger.info(print.name)
    })
    logger.info(`printer_device_name: ${printer_device_name}`)
    print_window.webContents.on("did-finish-load", function() {
        let print_options = { 
            silent: true, 
            printBackground: true, 
            deviceName: printer_device_name
        }
        print_window.webContents.print(print_options, (data) => {
            fs.unlinkSync(html_path)
        })
    })
}

function print_barcode(html_path){
    let windowOptions = {
        width: 500,
        height: 500,
        show: false
    }
    print_window = new BrowserWindow(windowOptions);
    print_window.loadURL(html_path)
    print_window.webContents.on("did-finish-load", function() {
        let print_options = { 
            silent: true, 
            printBackground: true, 
            deviceName: barcode_device_name
        }
        print_window.webContents.print(print_options, (data) => {
            console.log('print success')
        })
    })
}

function print_to_pdf(pdf_path){
    // let pdf_window_options = {
    //     width: 500,
    //     height: 500,
    //     show: true,
    //     autoHideMenuBar: true,
    //     webPreferences: {
    //         javascript: true,
    //         plugins: true
    //     }
    // }
    // pdf_window = new BrowserWindow(pdf_window_options)
    // pdf_window.loadURL('file://E:\\Practice\\pis_ele\\temp\\print.pdf')
    let pdf_window = new electronPDFWindow({
        width: 500,
        height: 500,
        show: true
    })
    pdf_window.loadURL('file://' + path.join(path.resolve(), '../../temp', 'print.pdf'))
    pdf_window.webContents.on("did-finish-load", function() {
        let print_pdf_options = {
            silent: true,
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            printSelectionOnly: false,
            landscape: true,
        }
        let print_options = { 
            silent: true, 
            printBackground: true, 
            deviceName: printer_device_name,
            generateDraftData: false
        }
        try{
            pdf_window.webContents.print(print_options, function(error, data) {
                if (error){
                    console.log("print error:" + error)
                    console.log("print data:" + data)
                }
                console.log('print-successs')
            })
        }catch(e){
            console.log("print error2:" + e)
        }
    })
    
}

function get_report_content(pathnum, type){
    return rp.post({ 
        url: `${main_window}/pis/api/report/get_report?pathnum=${pathnum}&type=${type}`,
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Cookie": `jwt=${jwt}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
}

function get_apply_content(pis_apply_id){
    return rp.post({ 
        url: `${main_window}/pis/api/records/get_appli`,
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Cookie": `jwt=${jwt}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            "pis_apply_id": pis_apply_id
        }
    })
}

function write_reg_report(apply_content, report_content, report_common, pathnum){
    logger.info('write_reg_report')
    logger.info(path.join(path.resolve(__dirname), '../../template', 'reg.html'))
    let reg_template = fs.readFileSync(path.join(path.resolve(__dirname), '../../template', 'reg.html')).toString()
    reg_template = reg_template.replace(/{{ pathnum }}/g, pathnum)
    reg_template = reg_template.replace(/{{ user_name }}/g, apply_content.basicMessage.name?apply_content.basicMessage.name:'')
    reg_template = reg_template.replace(/{{ user_gender }}/g,  apply_content.basicMessage.gender?apply_content.basicMessage.gender:'')
    reg_template = reg_template.replace(/{{ user_age }}/g, apply_content.basicMessage.age?apply_content.basicMessage.age:'')
    reg_template = reg_template.replace(/{{ user_deliverDate }}/g, apply_content.applyMessage.deliver_date?apply_content.applyMessage.deliver_date:'')
    reg_template = reg_template.replace(/{{ user_outpatient }}/g, apply_content.applyMessage.outpatient_num?apply_content.applyMessage.outpatient_num:'')
    reg_template = reg_template.replace(/{{ user_departments }}/g, apply_content.applyMessage.deliver_did?apply_content.applyMessage.deliver_did:'')
    reg_template = reg_template.replace(/{{ user_doctor }}/g, apply_content.applyMessage.deliver_doc?apply_content.applyMessage.deliver_doc:'')
    reg_template = reg_template.replace(/{{ user_admission }}/g, apply_content.applyMessage.admission_num?apply_content.applyMessage.admission_num:'')
    reg_template = reg_template.replace(/{{ user_bed }}/g, apply_content.applyMessage.bed_num?apply_content.applyMessage.bed_num:'')
    reg_template = reg_template.replace(/{{ user_id }}/g, apply_content.basicMessage.identify_id?apply_content.basicMessage.identify_id:'')
    reg_template = reg_template.replace(/{{ user_company }}/g, apply_content.applyMessage.deliver_org?apply_content.applyMessage.deliver_org:'')
    reg_template = reg_template.replace(/{{ reg_eye }}/g, report_content.eye?report_content.eye:'')
    reg_template = reg_template.replace(/{{ reg_microscopic }}/g, report_content.microscopic?report_content.microscopic:'')
    reg_template = reg_template.replace(/{{ reg_special }}/g, report_content.special?report_content.special:'')
    reg_template = reg_template.replace(/{{ reg_pathologic }}/g, report_content.pathologic?report_content.pathologic:'')
    reg_template = reg_template.replace(/{{ reg_remark }}/g, report_content.remark?report_content.remark:'')
    reg_template = reg_template.replace(/{{ firstDoc }}/g, report_common.firstDoc?report_common.firstDoc:'')
    reg_template = reg_template.replace(/{{ subsequentDoc }}/g, report_common.subsequentDoc?report_common.subsequentDoc:'')
    reg_template = reg_template.replace(/{{ date }}/g, report_common.date?report_common.date:'')
    if(report_content.images){
        let img_content = ""
        report_content.images.forEach(img_id => {
            img_content += `<img height="117" src="${main_window}/pis/api/common/get_img?img_id=${img_id}">,`
        });
        reg_template = reg_template.replace('{{ reg_imgs }}', img_content)
    }
    else{
        reg_template = reg_template.replace('{{ reg_imgs }}', '')
    }

    fd = fs.openSync(path.join(path.resolve(__dirname), '../../temp', 'reg.html'), 'w')
    fs.writeSync(fd, reg_template);
}

function get_lung_report(apply_content, report_content, pathnum){}

function write_apply(content, pathnum){
    let apply_template = fs.readFileSync(path.join(path.resolve(__dirname), '../../template', 'apply.html')).toString()
    apply_template = apply_template.replace(/{{ his_apply_id }}/g, content.applyMessage.his_apply_id?content.applyMessage.his_apply_id:'')
    apply_template = apply_template.replace(/{{ pathnum }}/g, pathnum?pathnum:'')
    apply_template = apply_template.replace(/{{ name }}/g, content.basicMessage.name?content.basicMessage.name:'')
    apply_template = apply_template.replace(/{{ age }}/g, content.basicMessage.age?content.basicMessage.age:'')
    apply_template = apply_template.replace(/{{ gender }}/g, content.basicMessage.gender?content.basicMessage.gender:'')
    apply_template = apply_template.replace(/{{ operating_room_tele }}/g, content.applyMessage.operating_room_tele?content.applyMessage.operating_room_tele:'')
    apply_template = apply_template.replace(/{{ admission_num }}/g, content.applyMessage.admission_num?content.applyMessage.admission_num:'')
    apply_template = apply_template.replace(/{{ district }}/g, content.applyMessage.district?content.applyMessage.district:'')
    apply_template = apply_template.replace(/{{ deliver_did }}/g, content.applyMessage.deliver_did?content.applyMessage.deliver_did:'')
    apply_template = apply_template.replace(/{{ deliver_date }}/g, content.applyMessage.deliver_date?content.applyMessage.deliver_date:'')
    apply_template = apply_template.replace(/{{ identify_id }}/g, content.basicMessage.identify_id?content.basicMessage.identify_id:'')
    apply_template = apply_template.replace(/{{ bed_num }}/g, content.applyMessage.bed_num?content.applyMessage.bed_num:'')
    apply_template = apply_template.replace(/{{ address }}/g, content.basicMessage.address?content.basicMessage.address:'')
    apply_template = apply_template.replace(/{{ contact }}/g, content.basicMessage.contact?content.basicMessage.contact:'')
    apply_template = apply_template.replace(/{{ contact_phone }}/g, content.basicMessage.contact_phone?content.basicMessage.contact_phone:'')
    apply_template = apply_template.replace(/{{ clinical_history }}/g, content.applyMessage.clinical_history?content.applyMessage.clinical_history:'')
    apply_template = apply_template.replace(/{{ clinical_diagnosis }}/g, content.applyMessage.clinical_diagnosis?content.applyMessage.clinical_diagnosis:'')
    apply_template = apply_template.replace(/{{ surgery_name }}/g, content.applyMessage.surgery_name?content.applyMessage.surgery_name:'')
    apply_template = apply_template.replace(/{{ surgery_message }}/g, content.applyMessage.surgery_message?content.applyMessage.surgery_message:'')
    apply_template = apply_template.replace(/{{ sampling_time }}/g, content.applyMessage.sampling_time?content.applyMessage.sampling_time:'')
    apply_template = apply_template.replace(/{{ deliver_doc }}/g, content.applyMessage.deliver_doc?content.applyMessage.deliver_doc:'')
    apply_template = apply_template.replace(/{{ menstrual_history }}/g, content.applyMessage.menstrual_history?content.applyMessage.menstrual_history:'')
    apply_template = apply_template.replace(/{{ childbearing_history }}/g, content.applyMessage.childbearing_history?content.applyMessage.childbearing_history:'')


    sample_result = Array()
    for(let i=0; i<20; i++){
        sample_result[i] = ["", ""]
    }
    let sample_receive_time = 0
    let sample_leave_time = 0
    sample_info = content.sample_info
    for(let j=0; j<sample_info.length; j++){
        if(sample_info[j].pathnum == pathnum && sample_info[j].status == "已接收"){
            if (sample_info[j].receive_time){
                let _time_stamp = new Date(sample_info[j].receive_time).getTime()
                if (_time_stamp < sample_leave_time){
                    sample_leave_time = _time_stamp
                }
                if (_time_stamp > sample_receive_time){
                    sample_receive_time = _time_stamp
                }
            }
            sample_result[j] = [sample_info[j].sampling_location, sample_info[j].sample_name]
        }
    }
    for(let k=0; k<20; k++){
        apply_template = apply_template.replace(`{{ sampling_location_${k+1} }}`, sample_result[k][0]?sample_result[k][0]:"")
        apply_template = apply_template.replace(`{{ sample_name_${k+1} }}`, sample_result[k][1]?sample_result[k][1]:"")
    }

    let sample_receive_time_print_value = ""
    if(sample_receive_time == 0){
        let d = new Date(sample_receive_time)
        sample_receive_time_print_value = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`
    }
    
    let sample_leave_time_print_value = ""
    if(sample_leave_time == 0){
        let d = new Date(sample_leave_time)
        sample_leave_time_print_value = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`
    }

    apply_template = apply_template.replace('{{ sample_receive_time }}', sample_receive_time_print_value)
    apply_template = apply_template.replace('{{ sample_leave_time }}', sample_leave_time_print_value)

    fd = fs.openSync(path.join(path.resolve(__dirname), '../../temp', 'apply.html'), 'w')
    fs.writeSync(fd, apply_template);
}
