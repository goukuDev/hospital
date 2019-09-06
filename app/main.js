const electron = require('electron')
const electronPDFWindow = require('electron-pdf-window')
const path = require("path")
const fs = require("fs")
const promise = require("bluebird")
const rp = require('request-promise')
const nodeCmd = require('node-cmd')
const jsBarcode = require('jsbarcode')
const ejs = require('ejs')
const exec = require('child_process').exec
const log4js = require('log4js')
const log4js_config = require("./logConf.json");

const {app,ipcMain,BrowserWindow,session} = electron;

var jwt = undefined;

var {
    server:MAIN_WINDOW,
    printName:printDeviceName,
    printBarcodeName:barcodeDeviceName,
} = getConfig();

log4js.configure(log4js_config);

// debug标志
var isDebug = (__dirname.endsWith(".asar"))? false : true;

// 日志管理工具
const logger = log4js.getLogger();


global.sharedObject = {
    printMoleculeLabelStatus: false,
    printMoleculeSampleStatus: false,
    printMoleculeApplicationStatus: false,
    moleculeLabel: undefined,
    moleculeSample: undefined,
    moleculeApplication: undefined
} 

app.commandLine.appendSwitch("--disable-http-cache")

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    logger.info('ready');
    getServerWindow();
});

function getServerWindow() {
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
    });

    mainWindow.loadURL(MAIN_WINDOW);
    // mainWindow.openDevTools()
    // mainWindow.show()

    mainWindow.on('closed', function(){  
        mainWindow = null
        session.defaultSession.clearStorageData()
    })

    ipcMain.on('print', function(event, arg) {
        session.defaultSession.cookies.get({}, async function(error, cookies) {
            if (error) throw error;
            jwt = cookies[0].value;

            

            //  ----------------- 优化-----------------
            if (arg.message_type == 'report') {
                logger.info('print report');
                logger.info(arg);
                let {type , pathnum} = arg
                let pdf_path = path.join(
                    path.resolve(__dirname),
                    '../../temp',
                    'print.pdf'
                );
                
                var reportData = await api(`${MAIN_WINDOW}/pis/api/report/get_report?pathnum=${pathnum}&type=${type}`);
                reportData = JSON.parse(reportData).data;
                let pisApplyId = reportData.pis_apply_id;
                let reportContent = reportData.content;

                var applyData = await api(`${MAIN_WINDOW}/pis/api/records/get_appli`,{pis_apply_id: pisApplyId});
                var apply_content = JSON.parse(applyData).data;
                if (type == 0) {
                    let modify_date = 0;
                    let report = undefined;
                    reportContent.report.forEach(function(_report) {
                        if (
                            _report.modifyDate &&
                            new Date(_report.modifyDate).getTime() > modify_date
                        ) {
                            report = _report;
                            modify_date = new Date(
                                _report.modifyDate
                            ).getTime();
                        }
                    });
                    if (report.type == 'reg') {
                        await write_reg_report(
                            apply_content,
                            report,
                            reportContent.common,
                            pathnum
                        );
                        html_path = path.join(
                            path.resolve(__dirname),
                            '../../temp',
                            'reg.html'
                        );
                        logger.info(`html_path: ${html_path}`);
                    } else if (report.type == 'lung') {
                        await get_lung_report(
                            apply_content,
                            report,
                            report_content.common,
                            pathnum
                        );
                        html_path = path.join(
                            path.resolve(__dirname),
                            '../../temp',
                            'lung.html'
                        );
                    }
                } 
                else{
                    report = reports[0]
                }
                print(html_path)
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
            else if(arg.message_type == 'moleculeLabelPre'){
                global.sharedObject.printMoleculeLabelStatus = true
                let windowOptions = {
                    width: 500,
                    height: 500,
                    show: false,
                    webPreferences: {
                        javascript: true,
                        plugins: true,
                        nodeIntegration: false, // 不集成 Nodejs
                        webSecurity: false,
                        preload: path.join(__dirname, 'public', 'renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
                    }
                }
                moleculeLabelPre_window = new BrowserWindow(windowOptions)
                moleculeLabelPre_window.loadURL(MAIN_WINDOW + '/' + arg.content)
                // moleculeLabelPre_window.openDevTools()
            }
            else if(arg.message_type == 'moleculeLabel'){
                let time_stamp = Date.now()
                let label_html_content = arg.content
                await saveFile(`temp\\moleculeLabel_${time_stamp}.html`, label_html_content)
                let moleculeLabel_window = new BrowserWindow({
                    width: 800,
                    height: 500,
                    show: false
                })
                if (isDebug){
                    var label_html_path = path.join(__dirname, `temp\\moleculeLabel_${time_stamp}.html`)
                } 
                else{
                    var label_html_path = path.join(path.dirname(path.dirname(__dirname)), `temp\\moleculeLabel_${time_stamp}.html`)
                } 
                moleculeLabel_window.loadURL(label_html_path)
                moleculeLabel_window.webContents.on("did-finish-load", function() {
                    moleculeLabel_window.webContents.printToPDF({}, function(error, data) {
                        if (error) throw error;
                        fs.writeFile(`./temp/moleculeLabel_${time_stamp}.pdf`, data, function(error) {
                            if (error){
                                throw error;
                            }
                            if (isDebug){
                                var file_path = path.join(__dirname, `temp\\moleculeLabel_${time_stamp}.pdf`)
                            } 
                            else{
                                var file_path = path.join(path.dirname(path.dirname(__dirname)), `temp\\moleculeLabel_${time_stamp}.pdf`)
                            } 
                            exec(`.\\PDFtoPrinter\\PDFtoPrinter.exe ${file_path} "${barcodeDeviceName}"`, (error)=>{
                                mainWindow.webContents.send("moleculeLabel-response", true)     
                                if(fs.existsSync(`temp\\moleculeLabel_${time_stamp}.html`)){
                                    fs.unlinkSync(`temp\\moleculeLabel_${time_stamp}.html`)
                                }
                                if(fs.existsSync(`temp\\moleculeLabel_${time_stamp}.pdf`)){
                                    fs.unlinkSync(`temp\\moleculeLabel_${time_stamp}.pdf`)
                                }
                                moleculeLabelPre_window.close()
                                moleculeLabel_window.close()
                                global.sharedObject.moleculeLabel = undefined
                                global.sharedObject.printMoleculeLabelStatus = false
                            })
                        })
                      })
                }) 
            }
            else if(arg.message_type == 'moleculeSamplePre'){
                // 打开窗口加载数据
                global.sharedObject.printMoleculeSampleStatus = true
                let windowOptions = {
                    width: 500,
                    height: 500,
                    show: false,
                    webPreferences: {
                        javascript: true,
                        plugins: true,
                        nodeIntegration: false, // 不集成 Nodejs
                        webSecurity: false,
                        preload: path.join(__dirname, 'public', 'renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
                    }
                }
                moleculeSamplePre_window = new BrowserWindow(windowOptions);
                moleculeSamplePre_window.loadURL(MAIN_WINDOW + '/' + arg.content)
                // moleculeSamplePre_window.openDevTools()
            }
            else if(arg.message_type == 'moleculeSample'){
                // 拿到生成数据的HTML
                let time_stamp = Date.now()
                let sample_html_header = arg.header
                await saveFile(`temp\\moleculeSample_header_${time_stamp}.html`, sample_html_header)
                let sample_html_content = arg.content
                await saveFile(`temp\\moleculeSample_content_${time_stamp}.html`, sample_html_content)
                let sample_html_footer = arg.footer
                await saveFile(`temp\\moleculeSample_footer_${time_stamp}.html`, sample_html_footer)
                let wkhtmltopdf_cmd = `wkhtmltopdf --header-html temp\\moleculeSample_header_${time_stamp}.html --footer-html temp\\moleculeSample_footer_${time_stamp}.html temp\\moleculeSample_content_${time_stamp}.html temp\\moleculeSample_${time_stamp}.pdf`
                if (isDebug){
                    var file_path = path.join(__dirname, `temp\\moleculeSample_${time_stamp}.pdf`)
                } 
                else{
                    var file_path = path.join(path.dirname(path.dirname(__dirname)), `temp\\moleculeSample_${time_stamp}.pdf`)
                }
                exec(wkhtmltopdf_cmd, function(){  
                    exec(`.\\PDFtoPrinter\\PDFtoPrinter.exe ${file_path} "${printDeviceName}"`, (error)=>{
                        if(fs.existsSync(`temp\\moleculeSample_header_${time_stamp}.html`)){
                            fs.unlinkSync(`temp\\moleculeSample_header_${time_stamp}.html`)
                        }
                        if(fs.existsSync(`temp\\moleculeSample_footer_${time_stamp}.html`)){
                            fs.unlinkSync(`temp\\moleculeSample_footer_${time_stamp}.html`)
                        }
                        if(fs.existsSync(`temp\\moleculeSample_content_${time_stamp}.html`)){
                            fs.unlinkSync(`temp\\moleculeSample_content_${time_stamp}.html`)
                        }
                        if(fs.existsSync(`temp\\moleculeSample_${time_stamp}.pdf`)){
                            fs.unlinkSync(`temp\\moleculeSample_${time_stamp}.pdf`)
                        }
                        moleculeSamplePre_window.close()
                        global.sharedObject.moleculeSample = undefined
                        global.sharedObject.printMoleculeSampleStatus = false
                    })
                })
            }
            else if(arg.message_type == 'moleculeApplicationPre'){
                global.sharedObject.printMoleculeApplicationStatus = true
                let windowOptions = {
                    width: 500,
                    height: 500,
                    show: false,
                    webPreferences: {
                        javascript: true,
                        plugins: true,
                        nodeIntegration: false, // 不集成 Nodejs
                        webSecurity: false,
                        preload: path.join(__dirname, 'public', 'renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
                    }
                }
                moleculeApplicationPre_window = new BrowserWindow(windowOptions);
                moleculeApplicationPre_window.loadURL(MAIN_WINDOW + '/' + arg.content)
                // print_window.openDevTools()
            }
            else if (arg.message_type == 'moleculeApplication'){
                let time_stamp = Date.now()
                let apply_html_content = arg.content
                await saveFile(`temp\\moleculeApplication_${time_stamp}.html`, apply_html_content)
                let wkhtmltopdf_cmd = `wkhtmltopdf --orientation Portrait temp\\moleculeApplication_${time_stamp}.html temp\\moleculeApplication_${time_stamp}.pdf`
                if (isDebug){
                    var file_path = path.join(__dirname, `temp\\moleculeApplication_${time_stamp}.pdf`)
                } 
                else{
                    var file_path = path.join(path.dirname(path.dirname(__dirname)), `temp\\moleculeApplication_${time_stamp}.pdf`)
                }   
                exec(wkhtmltopdf_cmd, function(){      
                    exec(`.\\PDFtoPrinter\\PDFtoPrinter.exe ${file_path} "${printDeviceName}"`, (error)=>{  
                        if(fs.existsSync(`temp\\moleculeApplication_${time_stamp}.html`)){
                            fs.unlinkSync(`temp\\moleculeApplication_${time_stamp}.html`)
                        }
                        if(fs.existsSync(`temp\\moleculeApplication_${time_stamp}.pdf`)){
                            fs.unlinkSync(`temp\\moleculeApplication_${time_stamp}.pdf`)
                        }
                        moleculeApplicationPre_window.close()
                        global.sharedObject.moleculeApplication = undefined
                        global.sharedObject.printMoleculeApplicationStatus = false
                    })
                })
            }
            else if (arg.message_type == 'moleculeHe'){
                console.log(`moleculeHe in`)
                let apply_ids = arg.apply_ids
                await rp.post({ 
                    url:`${MAIN_WINDOW}/pis/api/molecule/get_he_applications`,
                    headers: {
                        "Cookie": `jwt=${jwt}`
                    },
                    form:{
                        "apply_ids": JSON.stringify(apply_ids)
                    }
                }).then(function(body) {
                    var time_stamp = Date.now()
                    try{
                        var he_applications = {data: JSON.parse(body).data}
                        if (isDebug){
                            var ejs_template_path = path.join(__dirname, `template\\HE.ejs`)
                            var he_html_path = path.join(__dirname, `temp\\moleculeHe_${time_stamp}.html`)
                            var he_pdf_path = path.join(__dirname, `temp\\moleculeHe_${time_stamp}.pdf`)
                        } 
                        else{
                            var ejs_template_path = path.join(path.dirname(path.dirname(__dirname)), `template\\HE.ejs`)
                            var he_html_path = path.join(path.dirname(path.dirname(__dirname)), `temp\\moleculeHe_${time_stamp}.html`)
                            var he_pdf_path = path.join(path.dirname(path.dirname(__dirname)), `temp\\moleculeHe_${time_stamp}.pdf`)
                        }
                        ejs.renderFile(ejs_template_path, he_applications, function(err, str){
                            fs.writeFileSync(he_html_path, str)
                            let wkhtmltopdf_cmd = `wkhtmltopdf temp\\moleculeHe_${time_stamp}.html temp\\moleculeHe_${time_stamp}.pdf`
                            exec(wkhtmltopdf_cmd, function(err){
                                exec(`.\\PDFtoPrinter\\PDFtoPrinter.exe ${he_pdf_path} "${printDeviceName}"`, (error)=>{  
                                    if(fs.existsSync(`temp\\moleculeHe_${time_stamp}.html`)){
                                        fs.unlinkSync(`temp\\moleculeHe_${time_stamp}.html`)
                                    }
                                    if(fs.existsSync(`temp\\moleculeHe_${time_stamp}.pdf`)){
                                        fs.unlinkSync(`temp\\moleculeHe_${time_stamp}.pdf`)
                                    }
                                })
                            })
                        })
                    }
                    catch(err){
                        console.log(err)
                        logger.error(`error in print moleculeHe: ${err}`)
                    }   
                }).catch(function(err) {
                    logger.info(`err in get_he_applications: ${err}`)
                })
            }
        })
    })












}

function saveFile(filePath, fileData) {
    return new Promise((resolve, reject) => {
        // 块方式写入文件
        const wstream = fs.createWriteStream(filePath);
    
        wstream.on('open', () => {
            const blockSize = 128;
            const nbBlocks = Math.ceil(fileData.length / (blockSize));
            for (let i = 0; i < nbBlocks; i += 1) {
                const currentBlock = fileData.slice(
                    blockSize * i,
                    Math.min(blockSize * (i + 1), fileData.length),
                );
                wstream.write(currentBlock);
            }
            wstream.end();
        });
        wstream.on('error', (err) => { reject(err); });
        wstream.on('finish', () => { resolve(true); });
    });
}


function print(html_path) {
    logger.info('print in');
    let windowOptions = {
        width: 500,
        height: 500,
        show: false
    };
    print_window = new BrowserWindow(windowOptions);
    print_window.loadURL(html_path);
    let printers = print_window.webContents.getPrinters();
    printDeviceName = printers[0].name;
    printers.forEach(print => {
        logger.info(print.name);
    });
    logger.info(`printDeviceName: ${printDeviceName}`);
    print_window.webContents.on('did-finish-load', function() {
        let print_options = {
            silent: true,
            printBackground: true,
            deviceName: printDeviceName
        };
        print_window.webContents.print(print_options, data => {
            fs.unlinkSync(html_path);
        });
    });
}

function print_barcode(html_path) {
    let windowOptions = {
        width: 800,
        height: 500,
        show: true
    };
    print_window = new BrowserWindow(windowOptions);
    print_window.loadURL(html_path)
    print_window.webContents.on("did-finish-load", () => {
        console.log("print_barcode did-finish-load")
        let print_options = { 
            silent: true,
            printBackground: true,
            deviceName: barcodeDeviceName 
        }
        print_window.webContents.print(print_options, (data) => {
            console.log(`print result: ${data}`)
        })
    })
}

function print_pdf(pdf_path){
    let pdf_window = new electronPDFWindow({
        width: 800,
        height: 500,
        show: true,
        pageSize: 'A4',
        deviceName: printDeviceName
    })
    pdf_window.loadURL(pdf_path)
    pdf_window.on('closed', function(){  
        global.sharedObject.moleculeLabel = undefined
        global.sharedObject.moleculeApplication = undefined
    })
}

function get_report_content(pathnum, type) {
    return rp.post({
        url: `${MAIN_WINDOW}/pis/api/report/get_report?pathnum=${pathnum}&type=${type}`,
        headers: {
            Accept: 'application/json, text/plain, */*',
            Cookie: `jwt=${jwt}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

function get_apply_content(pis_apply_id) {
    return rp.post({
        url: `${MAIN_WINDOW}/pis/api/records/get_appli`,
        headers: {
            Accept: 'application/json, text/plain, */*',
            Cookie: `jwt=${jwt}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            pis_apply_id: pis_apply_id
        }
    });
}
// ------------------------------------------------ methods ---------------------------------------------
function api(url,data,headers){
    return rp.post({
        url:url,
        headers:{
            Accept: 'application/json, text/plain, */*',
            Cookie: `jwt=${jwt}`,
            'Content-Type': 'application/x-www-form-urlencoded'
            } || headers,
        form:data,
    })
}

function getConfig(){
    let configPath = isDebug ? path.join(__dirname, "app.config") : path.join(path.resolve(__dirname, '../..'), "app.config");
    let configData = JSON.parse(fs.readFileSync(configPath));

    // 设置默认值
    var appConfig = {
        server:'https://pis-demo.dipath.cn',
        printName:"Generic 36BW-8SeriesPCL",
        printBarcodeName:"ZDesigner GK888t (EPL)",
    }

    return Object.assign({},appConfig,configData);
}

function write_reg_report(
    apply_content,
    report_content,
    report_common,
    pathnum
) {
    logger.info('write_reg_report');
    logger.info(
        path.join(path.resolve(__dirname), '../../template', 'reg.html')
    );
    let reg_template = fs
        .readFileSync(
            path.join(path.resolve(__dirname), '../../template', 'reg.html')
        )
        .toString();
    reg_template = reg_template.replace(/{{ pathnum }}/g, pathnum);
    reg_template = reg_template.replace(
        /{{ user_name }}/g,
        apply_content.basicMessage.name ? apply_content.basicMessage.name : ''
    );
    reg_template = reg_template.replace(
        /{{ user_gender }}/g,
        apply_content.basicMessage.gender
            ? apply_content.basicMessage.gender
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_age }}/g,
        apply_content.basicMessage.age ? apply_content.basicMessage.age : ''
    );
    reg_template = reg_template.replace(
        /{{ user_deliverDate }}/g,
        apply_content.applyMessage.deliver_date
            ? apply_content.applyMessage.deliver_date
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_outpatient }}/g,
        apply_content.applyMessage.outpatient_num
            ? apply_content.applyMessage.outpatient_num
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_departments }}/g,
        apply_content.applyMessage.deliver_did
            ? apply_content.applyMessage.deliver_did
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_doctor }}/g,
        apply_content.applyMessage.deliver_doc
            ? apply_content.applyMessage.deliver_doc
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_admission }}/g,
        apply_content.applyMessage.admission_num
            ? apply_content.applyMessage.admission_num
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_bed }}/g,
        apply_content.applyMessage.bed_num
            ? apply_content.applyMessage.bed_num
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_id }}/g,
        apply_content.basicMessage.identify_id
            ? apply_content.basicMessage.identify_id
            : ''
    );
    reg_template = reg_template.replace(
        /{{ user_company }}/g,
        apply_content.applyMessage.deliver_org
            ? apply_content.applyMessage.deliver_org
            : ''
    );
    reg_template = reg_template.replace(
        /{{ reg_eye }}/g,
        report_content.eye ? report_content.eye : ''
    );
    reg_template = reg_template.replace(
        /{{ reg_microscopic }}/g,
        report_content.microscopic ? report_content.microscopic : ''
    );
    reg_template = reg_template.replace(
        /{{ reg_special }}/g,
        report_content.special ? report_content.special : ''
    );
    reg_template = reg_template.replace(
        /{{ reg_pathologic }}/g,
        report_content.pathologic ? report_content.pathologic : ''
    );
    reg_template = reg_template.replace(
        /{{ reg_remark }}/g,
        report_content.remark ? report_content.remark : ''
    );
    reg_template = reg_template.replace(
        /{{ firstDoc }}/g,
        report_common.firstDoc ? report_common.firstDoc : ''
    );
    reg_template = reg_template.replace(
        /{{ subsequentDoc }}/g,
        report_common.subsequentDoc ? report_common.subsequentDoc : ''
    );
    reg_template = reg_template.replace(
        /{{ date }}/g,
        report_common.date ? report_common.date : ''
    );
    if (report_content.images) {
        let img_content = '';
        report_content.images.forEach(img_id => {
            img_content += `<img height="117" src="${MAIN_WINDOW}/pis/api/common/get_img?img_id=${img_id}">,`;
        });
        reg_template = reg_template.replace('{{ reg_imgs }}', img_content);
    } else {
        reg_template = reg_template.replace('{{ reg_imgs }}', '');
    }

    fd = fs.openSync(
        path.join(path.resolve(__dirname), '../../temp', 'reg.html'),
        'w'
    );
    fs.writeSync(fd, reg_template);
}

function get_lung_report(apply_content, report_content, pathnum) {}

function write_apply(content, pathnum) {
    let apply_template = fs
        .readFileSync(
            path.join(path.resolve(__dirname), '../../template', 'apply.html')
        )
        .toString();
    apply_template = apply_template.replace(
        /{{ his_apply_id }}/g,
        content.applyMessage.his_apply_id
            ? content.applyMessage.his_apply_id
            : ''
    );
    apply_template = apply_template.replace(
        /{{ pathnum }}/g,
        pathnum ? pathnum : ''
    );
    apply_template = apply_template.replace(
        /{{ name }}/g,
        content.basicMessage.name ? content.basicMessage.name : ''
    );
    apply_template = apply_template.replace(
        /{{ age }}/g,
        content.basicMessage.age ? content.basicMessage.age : ''
    );
    apply_template = apply_template.replace(
        /{{ gender }}/g,
        content.basicMessage.gender ? content.basicMessage.gender : ''
    );
    apply_template = apply_template.replace(
        /{{ operating_room_tele }}/g,
        content.applyMessage.operating_room_tele
            ? content.applyMessage.operating_room_tele
            : ''
    );
    apply_template = apply_template.replace(
        /{{ admission_num }}/g,
        content.applyMessage.admission_num
            ? content.applyMessage.admission_num
            : ''
    );
    apply_template = apply_template.replace(
        /{{ district }}/g,
        content.applyMessage.district ? content.applyMessage.district : ''
    );
    apply_template = apply_template.replace(
        /{{ deliver_did }}/g,
        content.applyMessage.deliver_did ? content.applyMessage.deliver_did : ''
    );
    apply_template = apply_template.replace(
        /{{ deliver_date }}/g,
        content.applyMessage.deliver_date
            ? content.applyMessage.deliver_date
            : ''
    );
    apply_template = apply_template.replace(
        /{{ identify_id }}/g,
        content.basicMessage.identify_id ? content.basicMessage.identify_id : ''
    );
    apply_template = apply_template.replace(
        /{{ bed_num }}/g,
        content.applyMessage.bed_num ? content.applyMessage.bed_num : ''
    );
    apply_template = apply_template.replace(
        /{{ address }}/g,
        content.basicMessage.address ? content.basicMessage.address : ''
    );
    apply_template = apply_template.replace(
        /{{ contact }}/g,
        content.basicMessage.contact ? content.basicMessage.contact : ''
    );
    apply_template = apply_template.replace(
        /{{ contact_phone }}/g,
        content.basicMessage.contact_phone
            ? content.basicMessage.contact_phone
            : ''
    );
    apply_template = apply_template.replace(
        /{{ clinical_history }}/g,
        content.applyMessage.clinical_history
            ? content.applyMessage.clinical_history
            : ''
    );
    apply_template = apply_template.replace(
        /{{ clinical_diagnosis }}/g,
        content.applyMessage.clinical_diagnosis
            ? content.applyMessage.clinical_diagnosis
            : ''
    );
    apply_template = apply_template.replace(
        /{{ surgery_name }}/g,
        content.applyMessage.surgery_name
            ? content.applyMessage.surgery_name
            : ''
    );
    apply_template = apply_template.replace(
        /{{ surgery_message }}/g,
        content.applyMessage.surgery_message
            ? content.applyMessage.surgery_message
            : ''
    );
    apply_template = apply_template.replace(
        /{{ sampling_time }}/g,
        content.applyMessage.sampling_time
            ? content.applyMessage.sampling_time
            : ''
    );
    apply_template = apply_template.replace(
        /{{ deliver_doc }}/g,
        content.applyMessage.deliver_doc ? content.applyMessage.deliver_doc : ''
    );
    apply_template = apply_template.replace(
        /{{ menstrual_history }}/g,
        content.applyMessage.menstrual_history
            ? content.applyMessage.menstrual_history
            : ''
    );
    apply_template = apply_template.replace(
        /{{ childbearing_history }}/g,
        content.applyMessage.childbearing_history
            ? content.applyMessage.childbearing_history
            : ''
    );

    sample_result = Array()
    for(let i=0; i<20; i++){
        sample_result[i] = ["", ""]
    }
    let sample_receive_time = 0;
    let sample_leave_time = 0;
    sample_info = content.sample_info;
    for (let j = 0; j < sample_info.length; j++) {
        if (
            sample_info[j].pathnum == pathnum &&
            sample_info[j].status == '已接收'
        ) {
            if (sample_info[j].receive_time) {
                let _time_stamp = new Date(
                    sample_info[j].receive_time
                ).getTime();
                if (_time_stamp < sample_leave_time) {
                    sample_leave_time = _time_stamp;
                }
                if (_time_stamp > sample_receive_time) {
                    sample_receive_time = _time_stamp;
                }
            }
            sample_result[j] = [
                sample_info[j].sampling_location,
                sample_info[j].sample_name
            ];
        }
    }
    for (let k = 0; k < 20; k++) {
        apply_template = apply_template.replace(
            `{{ sampling_location_${k + 1} }}`,
            sample_result[k][0] ? sample_result[k][0] : ''
        );
        apply_template = apply_template.replace(
            `{{ sample_name_${k + 1} }}`,
            sample_result[k][1] ? sample_result[k][1] : ''
        );
    }

    let sample_receive_time_print_value = '';
    if (sample_receive_time == 0) {
        let d = new Date(sample_receive_time);
        sample_receive_time_print_value = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
    }

    let sample_leave_time_print_value = '';
    if (sample_leave_time == 0) {
        let d = new Date(sample_leave_time);
        sample_leave_time_print_value = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
    }

    apply_template = apply_template.replace(
        '{{ sample_receive_time }}',
        sample_receive_time_print_value
    );
    apply_template = apply_template.replace(
        '{{ sample_leave_time }}',
        sample_leave_time_print_value
    );

    fd = fs.openSync(
        path.join(path.resolve(__dirname), '../../temp', 'apply.html'),
        'w'
    );
    fs.writeSync(fd, apply_template);
}
