import { renderFileToString } from 'https://deno.land/x/dejs/mod.ts';
import { select, insert } from '../model/pg_model.ts';
import TSql from '../model/sql.ts';

const home = async({response} :{response : any}) => {
    const dataTable = await select(
        [
            {text : TSql ['KtgFindAll']},
            {text : TSql ['BlogInfoFindAll']}
        ]
    );
    const html = await renderFileToString("./view/home.ejs", {
        data : {
            navbar : dataTable[0],
            bloginfo : dataTable[1]
        },
        subview :{
            namafile : "./view/blog-main.ejs",
            viewjumbotron : true
        }
    });
    response.body = new TextEncoder().encode(html);
}
const signup = async({response, request, state} : {response : any, request : any, state : any}) => {
    if(!request.hasBody) {
        let signupError : string = '';
        if((state.pesanError != undefined) && (state.pesanError != '')) {
            signupError = state.pesanError;
        }
        const html = await renderFileToString("./view/home.ejs", {
            data : {
                navbar : await select({
                    text : TSql ['KtgFindInKode'],
                    args : ['hm','db', 'cp']
                }),
                bloginfo : await select({
                    text : TSql['BlogInfoFindAll']
                }),
                statusSignup : signupError
            },
            subview : {
                namafile : "./view/signup.ejs",
                viewjumbotron : false
            }
        });
        response.body = new TextEncoder().encode(html);
    } else {
        const body = await request.body().value;
        const parseData = new URLSearchParams(body);
        const namalengkap = parseData.get("fullname");
        const namauser = parseData.get("username");
        const pwd = parseData.get("paswd");

         let hasil = await insert({
             text : TSql['InsUser'],
             args : [namauser, namalengkap, pwd]
         });

         if(hasil[0] == 'Sukses'){
             state.pesanError = '';
            response.body = "Sukses Menyimpan Data Ke Database"
         } else {
             state.pesanError = hasil[1];
            response.redirect('/daftar');
         }
    }   
}
  
const kategori = async ({params, response} : {params : {id : string}, response : any}) => {
    response.body = "Id Parameter : "+params.id;
}
export {home, signup, kategori}