const mongoose = require('mongoose');
const {UserModel, findFaction} = require('../utils/model');
const email = require('../utils/email');
const signature = require('../utils/signature');
const request = require('request');

module.exports = async (req, res) => {
    mongoose.connect(process.env.DB_ADDR);

    let openornot = await UserModel.find({"name": "openornot"})
    if(openornot.toString() !== ""){
        console.log(openornot)
        //暂停提交申请
        res.status(360).send('Stop');
        return;
    }

    const faction = findFaction(req.body.faction);
    if(!faction || !req.body.qq || !req.body.js || !req.body.name || isNaN(req.body.qq = parseInt(req.body.qq))) {
        res.status(400).send('Bad Request');
        return;
    }
	
    const {name, qq, js} = req.body;

    let check1 = await UserModel.find({"name": name})
    if(check1.toString() !== ""){
        console.log(check1)
        //名称重复
        res.status(300).send('Name Existing');
        return;
    }

    let check2 = await UserModel.find({"qq": qq})
    if(check2.toString() !== ""){
        console.log(check2)
        //QQ重复
        res.status(350).send('QQ Existing');
        return;
    }

    let addUser = UserModel({
        qq,
        name,
        js,
        faction: faction.id
    })

    addUser.save(async (err, result) => {
        if (err) throw err;
        
        const ts = new Date().getTime();
        const approveSignature = signature(`${qq}|${ts}`);
        const link = `${process.env.HOST_ADDRESS}/api/true?qq=${qq}&token=${approveSignature}&t=${ts}`;
        const link2 = `${process.env.HOST_ADDRESS}/api/del?api=${process.env.API_SECRET}&qq=${qq}`;
        
        console.log('User saved successfully, approve link:', link);

        try {
            const styles = '<style>html{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{line-height:1.6;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:16px}body,dd,dl,fieldset,h1,h2,h3,h4,h5,ol,p,textarea,ul{margin:0}button,fieldset,input,legend,textarea{padding:0}button,input,select,textarea{font-family:inherit;font-size:100%;margin:0}ol,ul{padding-left:0;list-style-type:none}a img,fieldset{border:0}a{text-decoration:none}.radius_avatar{display:inline-block;background-color:#FFF;padding:3px;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;overflow:hidden;vertical-align:middle}.radius_avatar img{display:block;width:100%;height:100%;border-radius:50%;-moz-border-radius:50%;-webkit-border-radius:50%;background-color:#EEE}.btn_app{margin-top:10px;position:relative;display:block;margin-left:auto;margin-right:auto;padding-left:14px;padding-right:14px;-webkit-box-sizing:border-box;box-sizing:border-box;font-size:16px;text-align:center;text-decoration:none;color:#FFF;line-height:2.625;border-radius:5px;-webkit-tap-highlight-color:transparent;overflow:hidden}.btn_app:after{content:" ";width:200%;height:200%;position:absolute;top:0;left:0;border:1px solid rgba(0,0,0,.2);-webkit-transform:scale(.5);transform:scale(.5);-webkit-transform-origin:0 0;transform-origin:0 0;-webkit-box-sizing:border-box;box-sizing:border-box;border-radius:10px}.btn_app_primary{background-color:#42C642}.btn_app_primary:link,.btn_app_primary:visited{color:#FFF}.btn_app_primary:active{color:rgba(255,255,255,.6)}.btn_app_default{background-color:#F7F7F7;color:#454545}.btn_app_default:link,.btn_app_default:visited{color:#454545}.btn_app_default:active{color:#C9C9C9}body,html{position:relative;height:100%}a,a:link,a:visited{color:#42C642}.mail_area{text-align:center;height:100%;-webkit-box-sizing:border-box;box-sizing:border-box;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;font-family:"Helvetica Neue","Hiragino Sans GB","Microsoft YaHei","\9ED1\4F53",Arial,sans-serif}.mail{position:relative;display:inline-block;width:80%;margin-top:-150px;text-align:left}.mail_pc{background-color:#E6E6EA;display:block}.mail_pc .mail{width:850px;margin:45px 0;box-shadow:0 0 25px 5px rgba(0,0,0,.09);-moz-box-shadow:0 0 25px 5px rgba(0,0,0,.09);-webkit-box-shadow:0 0 25px 5px rgba(0,0,0,.09);background-color:#FFF;border-radius:8px;-moz-border-radius:8px;-webkit-border-radius:8px;overflow:hidden}.mail_pc .mail_inner{padding:17% 16%}.mail_pc .mail_msg .btn_app{width:225px}.pic_skin_top{position:absolute;top:0;left:0;width:145px;height:175px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJEAAACvBAMAAAAPhiHNAAAAFVBMVEUAAADY2OLh4eLY2NrX19rX19nb29z1cYcUAAAAB3RSTlMAGgQUEAgMAJvI/gAAAnxJREFUaN7t2MFy0zAUheEzIe46WLLXN4VkbbuQtZPSrkWYslaC4f0fgU07HphGVuN/2fMA3xxdSxolupzlx/xEpbLOh7ySafOlJgkV+ZAzanGlktnnS+lKBVbpQ74UqMVVaajAKq2pStpTlW6wSmuqklpoL2kJbW/pRFUq8i8Bat6doHl7CTq8UdD+rqagG2rc+k6Nu8geN1UpUJU6qpIXVSlQlTpBe6nWZE7QntQSOm9atNCQ9IkaUpE5JGrcgVrbgVpbJ2htlaC11RJzTLwpY09CkE4U9IOCPlPQkoIKDMr4bDuJ+f5flZP9zEM7ZtJxQYzkTYz0ICGSD2KknWmmNBYiJHeQEOnBNFMaHUByl53F4Q2SP6YO+ypb2t3qcrbjHyhpyX05T17RfUp6Vh6PSmaxn3oU3H17/H00TWXbjj8x52Tx63kCc6FN+/JhgUL574L0hF5SznCKf+751cyFjemvdYbEG3NGn2u30+b+tdvv7XV+tonHYX62/9W5bhMsNkPindBkz2a42CZ/E9w+DXdz/2x6+jPcj0g6M98qYzwmlZjUYFLEJKMkJ0qqMGmFST0mGSU5UVKFSQ0mRUwySvKipBKTekwySvKipBKTekwySvKipBKTIiU5UVKFSQ0mGSV5UdIKkwIleVFSiUmBkrwoqcSkQElelNRgklFSLUrqKcmJkkpMCpRUi5J6SnKipA6TjJJKUVKgpEqCpEhJtSgpUlItSoqUVIuSAiVVoiSjpE6Q5IySekFSLUoySuoESV6UFCipEyTVgiRnlBQFSZ0gqRYkeYMkZ4KkIEiKgqSzIOkgSDoLkqIYyQUxkjcx0k5M3EFQTO/JyF9Bt4tB+689SAAAAABJRU5ErkJggg==) no-repeat}.pic_skin_bottom{position:absolute;bottom:0;right:0;width:300px;height:265px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEJBAMAAADcMgfDAAAAFVBMVEUAAADY2OLg4OHZ2dvZ2drY2NvZ2dtyNy61AAAAB3RSTlMAGgUKFhIO15MmpwAABDhJREFUeNrs3EFqG0EYBeHW3zPaF/gAljRoPxpL+wbnAA2S9000vv8REifBkEAgsZEpw9QJPt4BXlpaWlr6XEXyFaczSdaLCWSsPAM2Vj6DjpWvoGPFEXysfcHHiiv4WPuCjxVX8LFyRcjag5B1xMh6QMiKhpAVFSErKkJWVISsqAhZURGyomJkNYysB4ysASOrx8jKGFlRlayGkTVgZK0xsqIoWQ0ja8DIyihZVckaMLIySlZVsgaMrIySNSpZPUpWUbIGjKxAyRqVrIyS1ZSsHiWrKlk9SlZVsjqUrKJkdShZRcnqULKqktWjZFUla42S1ZSsjJI1KlmBkjU4WUXJ6lGympKVUbI2TlZRsjqUrKZkZZSsjZNVlKw1StaoZAVKVu9kjUpWoGR1TlZTsgIlq3OympIVKFm9kzUqWYGS1TtZGyerKFkZJWvlZFUlK1Cyeidr42QVJSujZHVO1uhkFSVrjZK1crKak4WStXayVk7WyB89Xi7P03TYvrabpuf58vixrMJrd5ev0zb9tdid5vMHsTI/+/J0uE//0vY0l9uzuh8rTffpf4ppLrdljXdPh/SWdqfzDVnbd12M1N9ZmnZzMbJeZGclK6U4FiPre6eqZKW0873+/IKlpW/tnM1OwkAUhU+AuHbaadcTja6rTVjzE1gXMK750/d/BMuogRBDJFzgM/Z7gpN7T8/caWamoaGh4e8QNxfl+4ayjJsOXZe78u3lx4Hdj17L64i770ZFhxitnnVJWnHY/A0HdwDmo8lRXEJZ+0CdDtQsyACzQm0Zna9k3b47gWypGpioDX4lax77zgC/tPXUxBmRFXYxtXaGjIPVy3G2eNk8/WcNsFQbZPKKD07WZyrQZH01kCVr20BjvE6gfZ4GjlZ3Bo9v2uJngWer02ebtTMnToInP74J6178BIGi7FXVoniqxkE8VdmzgKpmAqr67h8qGfySd9TBuTzgzvbUzBC3bPfwhax4MIyFoAjrVMierSBT31A1uMAaCnjAbqMKaPehBLS7paqWmd1T1eDWnFwSL91jiuLOBPuoCnY237k5soVTEbMhFTEbsiDgouMLZAunIn6FqYhfoQ8iBmkl4lq400LQbSIfkJFVIf2eC+n3QsR8H4iY75lEzPcKGQ7R77yLV1u/ky7PpcxiBWSxEhGXHc8s1gDprKZYRxULGfAD5mrILFYi5L4iIIfSVBJwKC0Ugb00kQsZpXMJGKWZkOnQQxreB6Thd6MU9IZJgTR8LhF30hXT8PoPhu8wDb9AGr7FTPgOcv7TBDn/tZkjTQcZWpogQ6vNDK0OcizVAtnDVtPDI3hCLjxi9vCG2UOjvcWtangRX0jAeMgkYjwkEjEe4kyD27Z6ScDpIWFaq2JaKyCtlTOt1WNaq0BaK0Y8b0FMJAEXxBjxvJ/ekoCzVowH3lYsxgMvTC3j4QPTTiPJb6EN4gAAAABJRU5ErkJggg==) no-repeat}.mail_info{padding:1.7em 0 0 56px;margin-top:4.3em;position:relative;border-top:1px #BBBBBD dashed;font-size:14px}.mail_info .radius_avatar{width:38px;height:38px;padding:0;position:absolute;top:1.7em;left:0}.mail_info strong{font-weight:400}.mail_info p{color:#C1C1C3;margin-top:-.34em;font-size:12px}.mail_msg h2{font-weight:400;font-size:20px;color:#1D1D26;padding:1.34em 0 .6em}.mail_msg p{margin-bottom:24px}.mail_msg .btn_app{margin-top:45px}#app_mail .mail_msg .btn_app,#app_mail .mail_msg .btn_app:link,#app_mail .mail_msg .btn_app:visited{text-decoration:none}</style>';
            const body = styles + `
                <div class="mail_area mail_pc" id="app_mail">
                    <div class="mail">
                        <div class="mail_inner">
                            <div class="mail_msg">
                                <p>
                                    昵称：${name}<br>
                                    阵营：${faction.name}<br>
                                    QQ：${qq}<br>
                                    介绍：${js}<br>
                                    请在 24 小时内点击以下链接通过审批，
                                </p>
                                <p>
                                    <a href="${link}" target="_blank" rel="noopener">${link}</a>
                                </p>
                                <p>
                                    写的不好？点击以下链接驳回，
                                </p>
                                <p>
                                    <a href="${link2}" target="_blank" rel="noopener">${link2}</a>
                                </p>
                                <p>
                                    如果以上链接无法点击，请将上面的地址复制到你的浏览器地址栏进入。
                                </p>
                                <div class="mail_info" align="right">
                                    <strong>Mineroleplay</strong>
                                </div>
                            </div>
                            <div class="pic_skin_top"></div>
                            <div class="pic_skin_bottom"></div>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('send email:', await email.sendMail({
                subject: name+' 申请添加人物介绍',
                html: body,
                text: `昵称：${name}\r\n阵营：${faction.name}\r\nQQ：${qq}\r\n介绍：${js}。\r\n请在 24 小时内点击以下链接通过审批，\r\n\r\n${link}\r\n\r\n${link}\r\n写的不好？点击以下链接驳回，\r\n\r\n${link2}`,
                to: process.env.EMAIL_SENDTO //必须是数组，支持群发
            }))
        } catch (error) {
            console.error(error)
            //如果发送邮件失败，则删除该投稿
            request(process.env.HOST_ADDRESS+'/api/del?api='+process.env.API_SECRET+'&qq='+req.body.qq, function (error, response, body) {console.log(body)})
        } finally {
            res.json(result);
        }
    })
}