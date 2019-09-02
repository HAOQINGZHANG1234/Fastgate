/*ADOBE SYSTEMS INCORPORATED
Copyright 2012 Adobe Systems Incorporated
All Rights Reserved.

NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
terms of the Adobe license agreement accompanying it.  If you have received this file from a
source other than Adobe, then your use, modification, or distribution of it requires the prior
written permission of Adobe.*/
function cfinit(){
if(!window.ColdFusion){
ColdFusion={};
var $C=ColdFusion;
if(!$C.Ajax){
$C.Ajax={};
}
var $A=$C.Ajax;
if(!$C.AjaxProxy){
$C.AjaxProxy={};
}
var $X=$C.AjaxProxy;
if(!$C.Bind){
$C.Bind={};
}
var $B=$C.Bind;
if(!$C.Event){
$C.Event={};
}
var $E=$C.Event;
if(!$C.Log){
$C.Log={};
}
var $L=$C.Log;
if(!$C.Util){
$C.Util={};
}
var $U=$C.Util;
if(!$C.DOM){
$C.DOM={};
}
var $D=$C.DOM;
if(!$C.Spry){
$C.Spry={};
}
var $S=$C.Spry;
if(!$C.Pod){
$C.Pod={};
}
var $P=$C.Pod;
if(!$C.objectCache){
$C.objectCache={};
}
if(!$C.required){
$C.required={};
}
if(!$C.importedTags){
$C.importedTags=[];
}
if(!$C.requestCounter){
$C.requestCounter=0;
}
if(!$C.bindHandlerCache){
$C.bindHandlerCache={};
}
window._cf_loadingtexthtml="<div style=\"text-align: center;\">"+window._cf_loadingtexthtml+"&nbsp;"+CFMessage["loading"]+"</div>";
$C.globalErrorHandler=function(_760,_761){
if($L.isAvailable){
$L.error(_760,_761);
}
if($C.userGlobalErrorHandler){
$C.userGlobalErrorHandler(_760);
}
if(!$L.isAvailable&&!$C.userGlobalErrorHandler){
alert(_760+CFMessage["globalErrorHandler.alert"]);
}
};
$C.handleError=function(_762,_763,_764,_765,_766,_767,_768,_769){
var msg=$L.format(_763,_765);
if(_762){
$L.error(msg,"http");
if(!_766){
_766=-1;
}
if(!_767){
_767=msg;
}
_762(_766,_767,_769);
}else{
if(_768){
$L.error(msg,"http");
throw msg;
}else{
$C.globalErrorHandler(msg,_764);
}
}
};
$C.setGlobalErrorHandler=function(_76b){
$C.userGlobalErrorHandler=_76b;
};
$A.createXMLHttpRequest=function(){
try{
return new XMLHttpRequest();
}
catch(e){
}
var _76c=["Microsoft.XMLHTTP","MSXML2.XMLHTTP.5.0","MSXML2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP"];
for(var i=0;i<_76c.length;i++){
try{
return new ActiveXObject(_76c[i]);
}
catch(e){
}
}
return false;
};
$A.isRequestError=function(req){
return ((req.status!=0&&req.status!=200)||req.getResponseHeader("server-error"));
};
$A.sendMessage=function(url,_770,_771,_772,_773,_774,_775){
var req=$A.createXMLHttpRequest();
if(!_770){
_770="GET";
}
if(_772&&_773){
req.onreadystatechange=function(){
$A.callback(req,_773,_774);
};
}
if(_771){
_771+="&_cf_nodebug=true&_cf_nocache=true";
}else{
_771="_cf_nodebug=true&_cf_nocache=true";
}
if(window._cf_clientid){
_771+="&_cf_clientid="+_cf_clientid;
}
if(_770=="GET"){
if(_771){
_771+="&_cf_rc="+($C.requestCounter++);
if(url.indexOf("?")==-1){
url+="?"+_771;
}else{
url+="&"+_771;
}
}
$L.info("ajax.sendmessage.get","http",[url]);
req.open(_770,url,_772);
req.send(null);
}else{
$L.info("ajax.sendmessage.post","http",[url,_771]);
req.open(_770,url,_772);
req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
if(_771){
req.send(_771);
}else{
req.send(null);
}
}
if(!_772){
while(req.readyState!=4){
}
if($A.isRequestError(req)){
$C.handleError(null,"ajax.sendmessage.error","http",[req.status,req.statusText],req.status,req.statusText,_775);
}else{
return req;
}
}
};
$A.callback=function(req,_778,_779){
if(req.readyState!=4){
return;
}
req.onreadystatechange=new Function;
_778(req,_779);
};
$A.submitForm=function(_77a,url,_77c,_77d,_77e,_77f){
var _780=$C.getFormQueryString(_77a);
if(_780==-1){
$C.handleError(_77d,"ajax.submitform.formnotfound","http",[_77a],-1,null,true);
return;
}
if(!_77e){
_77e="POST";
}
_77f=!(_77f===false);
var _781=function(req){
$A.submitForm.callback(req,_77a,_77c,_77d);
};
$L.info("ajax.submitform.submitting","http",[_77a]);
var _783=$A.sendMessage(url,_77e,_780,_77f,_781);
if(!_77f){
$L.info("ajax.submitform.success","http",[_77a]);
return _783.responseText;
}
};
$A.submitForm.callback=function(req,_785,_786,_787){
if($A.isRequestError(req)){
$C.handleError(_787,"ajax.submitform.error","http",[req.status,_785,req.statusText],req.status,req.statusText);
}else{
$L.info("ajax.submitform.success","http",[_785]);
if(_786){
_786(req.responseText);
}
}
};
$C.empty=function(){
};
$C.setSubmitClicked=function(_788,_789){
var el=$D.getElement(_789,_788);
el.cfinputbutton=true;
$C.setClickedProperty=function(){
el.clicked=true;
};
$E.addListener(el,"click",$C.setClickedProperty);
};
$C.getFormQueryString=function(_78b,_78c){
var _78d;
if(typeof _78b=="string"){
_78d=(document.getElementById(_78b)||document.forms[_78b]);
}else{
if(typeof _78b=="object"){
_78d=_78b;
}
}
if(!_78d||null==_78d.elements){
return -1;
}
var _78e,elementName,elementValue,elementDisabled;
var _78f=false;
var _790=(_78c)?{}:"";
for(var i=0;i<_78d.elements.length;i++){
_78e=_78d.elements[i];
elementDisabled=_78e.disabled;
elementName=_78e.name;
elementValue=_78e.value;
if(!elementDisabled&&elementName){
switch(_78e.type){
case "select-one":
case "select-multiple":
for(var j=0;j<_78e.options.length;j++){
if(_78e.options[j].selected){
if(window.ActiveXObject){
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,_78e.options[j].attributes["value"].specified?_78e.options[j].value:_78e.options[j].text);
}else{
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,_78e.options[j].hasAttribute("value")?_78e.options[j].value:_78e.options[j].text);
}
}
}
break;
case "radio":
case "checkbox":
if(_78e.checked){
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,elementValue);
}
break;
case "file":
case undefined:
case "reset":
break;
case "button":
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,elementValue);
break;
case "submit":
if(_78e.cfinputbutton){
if(_78f==false&&_78e.clicked){
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,elementValue);
_78f=true;
}
}else{
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,elementValue);
}
break;
case "textarea":
var _793;
if(window.FCKeditorAPI&&(_793=$C.objectCache[elementName])&&_793.richtextid){
var _794=FCKeditorAPI.GetInstance(_793.richtextid);
if(_794){
elementValue=_794.GetXHTML();
}
}
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,elementValue);
break;
default:
_790=$C.getFormQueryString.processFormData(_790,_78c,elementName,elementValue);
break;
}
}
}
if(!_78c){
_790=_790.substr(0,_790.length-1);
}
return _790;
};
$C.getFormQueryString.processFormData=function(_795,_796,_797,_798){
if(_796){
if(_795[_797]){
_795[_797]+=","+_798;
}else{
_795[_797]=_798;
}
}else{
_795+=encodeURIComponent(_797)+"="+encodeURIComponent(_798)+"&";
}
return _795;
};
$A.importTag=function(_799){
$C.importedTags.push(_799);
};
$A.checkImportedTag=function(_79a){
var _79b=false;
for(var i=0;i<$C.importedTags.length;i++){
if($C.importedTags[i]==_79a){
_79b=true;
break;
}
}
if(!_79b){
$C.handleError(null,"ajax.checkimportedtag.error","widget",[_79a]);
}
};
$C.getElementValue=function(_79d,_79e,_79f){
if(!_79d){
$C.handleError(null,"getelementvalue.noelementname","bind",null,null,null,true);
return;
}
if(!_79f){
_79f="value";
}
var _7a0=$B.getBindElementValue(_79d,_79e,_79f);
if(typeof (_7a0)=="undefined"){
_7a0=null;
}
if(_7a0==null){
$C.handleError(null,"getelementvalue.elnotfound","bind",[_79d,_79f],null,null,true);
return;
}
return _7a0;
};
$B.getBindElementValue=function(_7a1,_7a2,_7a3,_7a4,_7a5){
var _7a6="";
if(window[_7a1]){
var _7a7=eval(_7a1);
if(_7a7&&_7a7._cf_getAttribute){
_7a6=_7a7._cf_getAttribute(_7a3);
return _7a6;
}
}
var _7a8=$C.objectCache[_7a1];
if(_7a8&&_7a8._cf_getAttribute){
_7a6=_7a8._cf_getAttribute(_7a3);
return _7a6;
}
var el=$D.getElement(_7a1,_7a2);
var _7aa=(el&&((!el.length&&el.length!=0)||(el.length&&el.length>0)||el.tagName=="SELECT"));
if(!_7aa&&!_7a5){
$C.handleError(null,"bind.getbindelementvalue.elnotfound","bind",[_7a1]);
return null;
}
if(el.tagName!="SELECT"){
if(el.length>1){
var _7ab=true;
for(var i=0;i<el.length;i++){
var _7ad=(el[i].getAttribute("type")=="radio"||el[i].getAttribute("type")=="checkbox");
if(!_7ad||(_7ad&&el[i].checked)){
if(!_7ab){
_7a6+=",";
}
_7a6+=$B.getBindElementValue.extract(el[i],_7a3);
_7ab=false;
}
}
}else{
_7a6=$B.getBindElementValue.extract(el,_7a3);
}
}else{
var _7ab=true;
for(var i=0;i<el.options.length;i++){
if(el.options[i].selected){
if(!_7ab){
_7a6+=",";
}
_7a6+=$B.getBindElementValue.extract(el.options[i],_7a3);
_7ab=false;
}
}
}
if(typeof (_7a6)=="object"){
$C.handleError(null,"bind.getbindelementvalue.simplevalrequired","bind",[_7a1,_7a3]);
return null;
}
if(_7a4&&$C.required[_7a1]&&_7a6.length==0){
return null;
}
return _7a6;
};
$B.getBindElementValue.extract=function(el,_7af){
var _7b0=el[_7af];
if((_7b0==null||typeof (_7b0)=="undefined")&&el.getAttribute){
_7b0=el.getAttribute(_7af);
}
return _7b0;
};
$L.init=function(){
if(window.YAHOO&&YAHOO.widget&&YAHOO.widget.Logger){
YAHOO.widget.Logger.categories=[CFMessage["debug"],CFMessage["info"],CFMessage["error"],CFMessage["window"]];
YAHOO.widget.LogReader.prototype.formatMsg=function(_7b1){
var _7b2=_7b1.category;
return "<p>"+"<span class='"+_7b2+"'>"+_7b2+"</span>:<i>"+_7b1.source+"</i>: "+_7b1.msg+"</p>";
};
var _7b3=new YAHOO.widget.LogReader(null,{width:"30em",fontSize:"100%"});
_7b3.setTitle(CFMessage["log.title"]||"ColdFusion AJAX Logger");
_7b3._btnCollapse.value=CFMessage["log.collapse"]||"Collapse";
_7b3._btnPause.value=CFMessage["log.pause"]||"Pause";
_7b3._btnClear.value=CFMessage["log.clear"]||"Clear";
$L.isAvailable=true;
}
};
$L.log=function(_7b4,_7b5,_7b6,_7b7){
if(!$L.isAvailable){
return;
}
if(!_7b6){
_7b6="global";
}
_7b6=CFMessage[_7b6]||_7b6;
_7b5=CFMessage[_7b5]||_7b5;
_7b4=$L.format(_7b4,_7b7);
YAHOO.log(_7b4,_7b5,_7b6);
};
$L.format=function(code,_7b9){
var msg=CFMessage[code]||code;
if(_7b9){
for(i=0;i<_7b9.length;i++){
if(!_7b9[i].length){
_7b9[i]="";
}
var _7bb="{"+i+"}";
msg=msg.replace(_7bb,_7b9[i]);
}
}
return msg;
};
$L.debug=function(_7bc,_7bd,_7be){
$L.log(_7bc,"debug",_7bd,_7be);
};
$L.info=function(_7bf,_7c0,_7c1){
$L.log(_7bf,"info",_7c0,_7c1);
};
$L.error=function(_7c2,_7c3,_7c4){
$L.log(_7c2,"error",_7c3,_7c4);
};
$L.dump=function(_7c5,_7c6){
if($L.isAvailable){
var dump=(/string|number|undefined|boolean/.test(typeof (_7c5))||_7c5==null)?_7c5:recurse(_7c5,typeof _7c5,true);
$L.debug(dump,_7c6);
}
};
$X.invoke=function(_7c8,_7c9,_7ca,_7cb,_7cc){
return $X.invokeInternal(_7c8,_7c9,_7ca,_7cb,_7cc,false,null,null);
};
$X.invokeInternal=function(_7cd,_7ce,_7cf,_7d0,_7d1,_7d2,_7d3,_7d4){
var _7d5="method="+_7ce+"&_cf_ajaxproxytoken="+_7cf;
if(_7d2){
_7d5+="&_cfclient="+"true";
var _7d6=$X.JSON.encodeInternal(_7cd._variables,_7d2);
_7d5+="&_variables="+encodeURIComponent(_7d6);
var _7d7=$X.JSON.encodeInternal(_7cd._metadata,_7d2);
_7d5+="&_metadata="+encodeURIComponent(_7d7);
}
var _7d8=_7cd.returnFormat||"json";
_7d5+="&returnFormat="+_7d8;
if(_7cd.queryFormat){
_7d5+="&queryFormat="+_7cd.queryFormat;
}
if(_7cd.formId){
var _7d9=$C.getFormQueryString(_7cd.formId,true);
if(_7d0!=null){
for(prop in _7d9){
_7d0[prop]=_7d9[prop];
}
}else{
_7d0=_7d9;
}
_7cd.formId=null;
}
var _7da="";
if(_7d0!=null){
_7da=$X.JSON.encodeInternal(_7d0,_7d2);
_7d5+="&argumentCollection="+encodeURIComponent(_7da);
}
$L.info("ajaxproxy.invoke.invoking","http",[_7cd.cfcPath,_7ce,_7da]);
if(_7cd.callHandler){
_7cd.callHandler.call(null,_7cd.callHandlerParams,_7cd.cfcPath,_7d5);
return;
}
var _7db;
var _7dc=_7cd.async;
if(_7d3!=null){
_7dc=true;
_7db=function(req){
$X.callbackOp(req,_7cd,_7d1,_7d3,_7d4);
};
}else{
if(_7cd.async){
_7db=function(req){
$X.callback(req,_7cd,_7d1);
};
}
}
var req=$A.sendMessage(_7cd.cfcPath,_7cd.httpMethod,_7d5,_7dc,_7db,null,true);
if(!_7dc){
return $X.processResponse(req,_7cd);
}
};
$X.callback=function(req,_7e1,_7e2){
if($A.isRequestError(req)){
$C.handleError(_7e1.errorHandler,"ajaxproxy.invoke.error","http",[req.status,_7e1.cfcPath,req.statusText],req.status,req.statusText,false,_7e2);
}else{
if(_7e1.callbackHandler){
var _7e3=$X.processResponse(req,_7e1);
_7e1.callbackHandler(_7e3,_7e2);
}
}
};
$X.callbackOp=function(req,_7e5,_7e6,_7e7,_7e8){
if($A.isRequestError(req)){
var _7e9=_7e5.errorHandler;
if(_7e8!=null){
_7e9=_7e8;
}
$C.handleError(_7e9,"ajaxproxy.invoke.error","http",[req.status,_7e5.cfcPath,req.statusText],req.status,req.statusText,false,_7e6);
}else{
if(_7e7){
var _7ea=$X.processResponse(req,_7e5);
_7e7(_7ea,_7e6);
}
}
};
$X.processResponse=function(req,_7ec){
var _7ed=true;
for(var i=0;i<req.responseText.length;i++){
var c=req.responseText.charAt(i);
_7ed=(c==" "||c=="\n"||c=="\t"||c=="\r");
if(!_7ed){
break;
}
}
var _7f0=(req.responseXML&&req.responseXML.childNodes.length>0);
var _7f1=_7f0?"[XML Document]":req.responseText;
$L.info("ajaxproxy.invoke.response","http",[_7f1]);
var _7f2;
var _7f3=_7ec.returnFormat||"json";
if(_7f3=="json"){
try{
_7f2=_7ed?null:$X.JSON.decode(req.responseText);
}
catch(e){
if(typeof _7ec._metadata!=="undefined"&&_7ec._metadata.servercfc&&typeof req.responseText==="string"){
_7f2=req.responseText;
}else{
throw e;
}
}
}else{
_7f2=_7f0?req.responseXML:(_7ed?null:req.responseText);
}
return _7f2;
};
$X.init=function(_7f4,_7f5,_7f6){
if(typeof _7f6==="undefined"){
_7f6=false;
}
var _7f7=_7f5;
if(!_7f6){
var _7f8=_7f5.split(".");
var ns=self;
for(i=0;i<_7f8.length-1;i++){
if(_7f8[i].length){
ns[_7f8[i]]=ns[_7f8[i]]||{};
ns=ns[_7f8[i]];
}
}
var _7fa=_7f8[_7f8.length-1];
if(ns[_7fa]){
return ns[_7fa];
}
ns[_7fa]=function(){
this.httpMethod="GET";
this.async=false;
this.callbackHandler=null;
this.errorHandler=null;
this.formId=null;
};
_7f7=ns[_7fa].prototype;
}else{
_7f7.httpMethod="GET";
_7f7.async=false;
_7f7.callbackHandler=null;
_7f7.errorHandler=null;
_7f7.formId=null;
}
_7f7.cfcPath=_7f4;
_7f7.setHTTPMethod=function(_7fb){
if(_7fb){
_7fb=_7fb.toUpperCase();
}
if(_7fb!="GET"&&_7fb!="POST"){
$C.handleError(null,"ajaxproxy.sethttpmethod.invalidmethod","http",[_7fb],null,null,true);
}
this.httpMethod=_7fb;
};
_7f7.setSyncMode=function(){
this.async=false;
};
_7f7.setAsyncMode=function(){
this.async=true;
};
_7f7.setCallbackHandler=function(fn){
this.callbackHandler=fn;
this.setAsyncMode();
};
_7f7.setErrorHandler=function(fn){
this.errorHandler=fn;
this.setAsyncMode();
};
_7f7.setForm=function(fn){
this.formId=fn;
};
_7f7.setQueryFormat=function(_7ff){
if(_7ff){
_7ff=_7ff.toLowerCase();
}
if(!_7ff||(_7ff!="column"&&_7ff!="row"&&_7ff!="struct")){
$C.handleError(null,"ajaxproxy.setqueryformat.invalidformat","http",[_7ff],null,null,true);
}
this.queryFormat=_7ff;
};
_7f7.setReturnFormat=function(_800){
if(_800){
_800=_800.toLowerCase();
}
if(!_800||(_800!="plain"&&_800!="json"&&_800!="wddx")){
$C.handleError(null,"ajaxproxy.setreturnformat.invalidformat","http",[_800],null,null,true);
}
this.returnFormat=_800;
};
$L.info("ajaxproxy.init.created","http",[_7f4]);
if(_7f6){
return _7f7;
}else{
return ns[_7fa];
}
};
$U.isWhitespace=function(s){
var _802=true;
for(var i=0;i<s.length;i++){
var c=s.charAt(i);
_802=(c==" "||c=="\n"||c=="\t"||c=="\r");
if(!_802){
break;
}
}
return _802;
};
$U.getFirstNonWhitespaceIndex=function(s){
var _806=true;
for(var i=0;i<s.length;i++){
var c=s.charAt(i);
_806=(c==" "||c=="\n"||c=="\t"||c=="\r");
if(!_806){
break;
}
}
return i;
};
$C.trim=function(_809){
return _809.replace(/^\s+|\s+$/g,"");
};
$U.isInteger=function(n){
var _80b=true;
if(typeof (n)=="number"){
_80b=(n>=0);
}else{
for(i=0;i<n.length;i++){
if($U.isInteger.numberChars.indexOf(n.charAt(i))==-1){
_80b=false;
break;
}
}
}
return _80b;
};
$U.isInteger.numberChars="0123456789";
$U.isArray=function(a){
return (typeof (a.length)=="number"&&!a.toUpperCase);
};
$U.isBoolean=function(b){
if(b===true||b===false){
return true;
}else{
if(b.toLowerCase){
b=b.toLowerCase();
return (b==$U.isBoolean.trueChars||b==$U.isBoolean.falseChars);
}else{
return false;
}
}
};
$U.isBoolean.trueChars="true";
$U.isBoolean.falseChars="false";
$U.castBoolean=function(b){
if(b===true){
return true;
}else{
if(b===false){
return false;
}else{
if(b.toLowerCase){
b=b.toLowerCase();
if(b==$U.isBoolean.trueChars){
return true;
}else{
if(b==$U.isBoolean.falseChars){
return false;
}else{
return false;
}
}
}else{
return false;
}
}
}
};
$U.checkQuery=function(o){
var _810=null;
if(o&&o.COLUMNS&&$U.isArray(o.COLUMNS)&&o.DATA&&$U.isArray(o.DATA)&&(o.DATA.length==0||(o.DATA.length>0&&$U.isArray(o.DATA[0])))){
_810="row";
}else{
if(o&&o.COLUMNS&&$U.isArray(o.COLUMNS)&&o.ROWCOUNT&&$U.isInteger(o.ROWCOUNT)&&o.DATA){
_810="col";
for(var i=0;i<o.COLUMNS.length;i++){
var _812=o.DATA[o.COLUMNS[i]];
if(!_812||!$U.isArray(_812)){
_810=null;
break;
}
}
}
}
return _810;
};
$X.JSON=new function(){
var _813={}.hasOwnProperty?true:false;
var _814=/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/;
var pad=function(n){
return n<10?"0"+n:n;
};
var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"};
var _818=function(s){
if(/["\\\x00-\x1f]/.test(s)){
return "\""+s.replace(/([\x00-\x1f\\"])/g,function(a,b){
var c=m[b];
if(c){
return c;
}
c=b.charCodeAt();
return "\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16);
})+"\"";
}
return "\""+s+"\"";
};
var _81d=function(o){
var a=["["],b,i,l=o.length,v;
for(i=0;i<l;i+=1){
v=o[i];
switch(typeof v){
case "undefined":
case "function":
case "unknown":
break;
default:
if(b){
a.push(",");
}
a.push(v===null?"null":$X.JSON.encode(v));
b=true;
}
}
a.push("]");
return a.join("");
};
var _820=function(o){
return "\""+o.getFullYear()+"-"+pad(o.getMonth()+1)+"-"+pad(o.getDate())+"T"+pad(o.getHours())+":"+pad(o.getMinutes())+":"+pad(o.getSeconds())+"\"";
};
this.encode=function(o){
return this.encodeInternal(o,false);
};
this.encodeInternal=function(o,cfc){
if(typeof o=="undefined"||o===null){
return "null";
}else{
if(o instanceof Array){
return _81d(o);
}else{
if(o instanceof Date){
if(cfc){
return this.encodeInternal({_date_:o.getTime()},cfc);
}
return _820(o);
}else{
if(typeof o=="string"){
return _818(o);
}else{
if(typeof o=="number"){
return isFinite(o)?String(o):"null";
}else{
if(typeof o=="boolean"){
return String(o);
}else{
if(cfc&&typeof o=="object"&&typeof o._metadata!=="undefined"){
return "{\"_metadata\":"+this.encodeInternal(o._metadata,false)+",\"_variables\":"+this.encodeInternal(o._variables,cfc)+"}";
}else{
var a=["{"],b,i,v;
for(var i in o){
if(!_813||o.hasOwnProperty(i)){
v=o[i];
switch(typeof v){
case "undefined":
case "function":
case "unknown":
break;
default:
if(b){
a.push(",");
}
a.push(this.encodeInternal(i,cfc),":",v===null?"null":this.encodeInternal(v,cfc));
b=true;
}
}
}
a.push("}");
return a.join("");
}
}
}
}
}
}
}
};
this.decode=function(json){
if(typeof json=="object"){
return json;
}
if($U.isWhitespace(json)){
return null;
}
var _828=$U.getFirstNonWhitespaceIndex(json);
if(_828>0){
json=json.slice(_828);
}
if(window._cf_jsonprefix&&json.indexOf(_cf_jsonprefix)==0){
json=json.slice(_cf_jsonprefix.length);
}
try{
if(_814.test(json)){
return eval("("+json+")");
}
}
catch(e){
}
throw new SyntaxError("parseJSON");
};
}();
if(!$C.JSON){
$C.JSON={};
}
$C.JSON.encode=$X.JSON.encode;
$C.JSON.encodeInternal=$X.JSON.encodeInternal;
$C.JSON.decode=$X.JSON.decode;
$C.navigate=function(url,_82a,_82b,_82c,_82d,_82e){
if(url==null){
$C.handleError(_82c,"navigate.urlrequired","widget");
return;
}
if(_82d){
_82d=_82d.toUpperCase();
if(_82d!="GET"&&_82d!="POST"){
$C.handleError(null,"navigate.invalidhttpmethod","http",[_82d],null,null,true);
}
}else{
_82d="GET";
}
var _82f;
if(_82e){
_82f=$C.getFormQueryString(_82e);
if(_82f==-1){
$C.handleError(null,"navigate.formnotfound","http",[_82e],null,null,true);
}
}
if(_82a==null){
if(_82f){
if(url.indexOf("?")==-1){
url+="?"+_82f;
}else{
url+="&"+_82f;
}
}
$L.info("navigate.towindow","widget",[url]);
window.location.replace(url);
return;
}
$L.info("navigate.tocontainer","widget",[url,_82a]);
var obj=$C.objectCache[_82a];
if(obj!=null){
if(typeof (obj._cf_body)!="undefined"&&obj._cf_body!=null){
_82a=obj._cf_body;
}
}
$A.replaceHTML(_82a,url,_82d,_82f,_82b,_82c);
};
$A.checkForm=function(_831,_832,_833,_834,_835){
var _836=_832.call(null,_831);
if(_836==false){
return false;
}
var _837=$C.getFormQueryString(_831);
$L.info("ajax.submitform.submitting","http",[_831.name]);
$A.replaceHTML(_833,_831.action,_831.method,_837,_834,_835);
return false;
};
$A.replaceHTML=function(_838,url,_83a,_83b,_83c,_83d){
var _83e=document.getElementById(_838);
if(!_83e){
$C.handleError(_83d,"ajax.replacehtml.elnotfound","http",[_838]);
return;
}
var _83f="_cf_containerId="+encodeURIComponent(_838);
_83b=(_83b)?_83b+"&"+_83f:_83f;
$L.info("ajax.replacehtml.replacing","http",[_838,url,_83b]);
if(_cf_loadingtexthtml){
try{
_83e.innerHTML=_cf_loadingtexthtml;
}
catch(e){
}
}
var _840=function(req,_842){
var _843=false;
if($A.isRequestError(req)){
$C.handleError(_83d,"ajax.replacehtml.error","http",[req.status,_842.id,req.statusText],req.status,req.statusText);
_843=true;
}
var _844=new $E.CustomEvent("onReplaceHTML",_842);
var _845=new $E.CustomEvent("onReplaceHTMLUser",_842);
$E.loadEvents[_842.id]={system:_844,user:_845};
if(req.responseText.search(/<script/i)!=-1){
try{
_842.innerHTML="";
}
catch(e){
}
$A.replaceHTML.processResponseText(req.responseText,_842,_83d);
}else{
try{
_842.innerHTML=req.responseText;
$A.updateLayouttab(_842);
}
catch(e){
}
}
$E.loadEvents[_842.id]=null;
_844.fire();
_844.unsubscribe();
_845.fire();
_845.unsubscribe();
$L.info("ajax.replacehtml.success","http",[_842.id]);
if(_83c&&!_843){
_83c();
}
};
try{
$A.sendMessage(url,_83a,_83b,true,_840,_83e);
}
catch(e){
try{
_83e.innerHTML=$L.format(CFMessage["ajax.replacehtml.connectionerrordisplay"],[url,e]);
}
catch(e){
}
$C.handleError(_83d,"ajax.replacehtml.connectionerror","http",[_838,url,e]);
}
};
$A.replaceHTML.processResponseText=function(text,_847,_848){
var pos=0;
var _84a=0;
var _84b=0;
_847._cf_innerHTML="";
while(pos<text.length){
var _84c=text.indexOf("<s",pos);
if(_84c==-1){
_84c=text.indexOf("<S",pos);
}
if(_84c==-1){
break;
}
pos=_84c;
var _84d=true;
var _84e=$A.replaceHTML.processResponseText.scriptTagChars;
for(var i=1;i<_84e.length;i++){
var _850=pos+i+1;
if(_850>text.length){
break;
}
var _851=text.charAt(_850);
if(_84e[i][0]!=_851&&_84e[i][1]!=_851){
pos+=i+1;
_84d=false;
break;
}
}
if(!_84d){
continue;
}
var _852=text.substring(_84a,pos);
if(_852){
_847._cf_innerHTML+=_852;
}
var _853=text.indexOf(">",pos)+1;
if(_853==0){
pos++;
continue;
}else{
pos+=7;
}
var _854=_853;
while(_854<text.length&&_854!=-1){
_854=text.indexOf("</s",_854);
if(_854==-1){
_854=text.indexOf("</S",_854);
}
if(_854!=-1){
_84d=true;
for(var i=1;i<_84e.length;i++){
var _850=_854+2+i;
if(_850>text.length){
break;
}
var _851=text.charAt(_850);
if(_84e[i][0]!=_851&&_84e[i][1]!=_851){
_854=_850;
_84d=false;
break;
}
}
if(_84d){
break;
}
}
}
if(_854!=-1){
var _855=text.substring(_853,_854);
var _856=_855.indexOf("<!--");
if(_856!=-1){
_855=_855.substring(_856+4);
}
var _857=_855.lastIndexOf("//-->");
if(_857!=-1){
_855=_855.substring(0,_857-1);
}
if(_855.indexOf("document.write")!=-1||_855.indexOf("CF_RunContent")!=-1){
if(_855.indexOf("CF_RunContent")!=-1){
_855=_855.replace("CF_RunContent","document.write");
}
_855="var _cfDomNode = document.getElementById('"+_847.id+"'); var _cfBuffer='';"+"if (!document._cf_write)"+"{document._cf_write = document.write;"+"document.write = function(str){if (_cfBuffer!=null){_cfBuffer+=str;}else{document._cf_write(str);}};};"+_855+";_cfDomNode._cf_innerHTML += _cfBuffer; _cfBuffer=null;";
}
try{
eval(_855);
}
catch(ex){
$C.handleError(_848,"ajax.replacehtml.jserror","http",[_847.id,ex]);
}
}
_84c=text.indexOf(">",_854)+1;
if(_84c==0){
_84b=_854+1;
break;
}
_84b=_84c;
pos=_84c;
_84a=_84c;
}
if(_84b<text.length-1){
var _852=text.substring(_84b,text.length);
if(_852){
_847._cf_innerHTML+=_852;
}
}
try{
_847.innerHTML=_847._cf_innerHTML;
$A.updateLayouttab(_847);
}
catch(e){
}
_847._cf_innerHTML="";
};
$A.updateLayouttab=function(_858){
var _859=_858.id;
if(_859.length>13&&_859.indexOf("cf_layoutarea")==0){
var s=_859.substr(13,_859.length);
var cmp=Ext.getCmp(s);
var _85c=_858.innerHTML;
if(cmp){
cmp.update("<div id="+_858.id+">"+_858.innerHTML+"</div>");
}
var _85d=document.getElementById(_859);
if(_85d){
_85d.innerHTML=_85c;
}
}
};
$A.replaceHTML.processResponseText.scriptTagChars=[["s","S"],["c","C"],["r","R"],["i","I"],["p","P"],["t","T"]];
$D.getElement=function(_85e,_85f){
var _860=function(_861){
return (_861.name==_85e||_861.id==_85e);
};
var _862=$D.getElementsBy(_860,null,_85f);
if(_862.length==1){
return _862[0];
}else{
return _862;
}
};
$D.getElementsBy=function(_863,tag,root){
tag=tag||"*";
var _866=[];
if(root){
root=$D.get(root);
if(!root){
return _866;
}
}else{
root=document;
}
var _867=root.getElementsByTagName(tag);
if(!_867.length&&(tag=="*"&&root.all)){
_867=root.all;
}
for(var i=0,len=_867.length;i<len;++i){
if(_863(_867[i])){
_866[_866.length]=_867[i];
}
}
return _866;
};
$D.get=function(el){
if(!el){
return null;
}
if(typeof el!="string"&&!(el instanceof Array)){
return el;
}
if(typeof el=="string"){
return document.getElementById(el);
}else{
var _86a=[];
for(var i=0,len=el.length;i<len;++i){
_86a[_86a.length]=$D.get(el[i]);
}
return _86a;
}
return null;
};
$E.loadEvents={};
$E.CustomEvent=function(_86c,_86d){
return {name:_86c,domNode:_86d,subs:[],subscribe:function(func,_86f){
var dup=false;
for(var i=0;i<this.subs.length;i++){
var sub=this.subs[i];
if(sub.f==func&&sub.p==_86f){
dup=true;
break;
}
}
if(!dup){
this.subs.push({f:func,p:_86f});
}
},fire:function(){
for(var i=0;i<this.subs.length;i++){
var sub=this.subs[i];
sub.f.call(null,this,sub.p);
}
},unsubscribe:function(){
this.subscribers=[];
}};
};
$E.windowLoadImpEvent=new $E.CustomEvent("cfWindowLoadImp");
$E.windowLoadEvent=new $E.CustomEvent("cfWindowLoad");
$E.windowLoadUserEvent=new $E.CustomEvent("cfWindowLoadUser");
$E.listeners=[];
$E.addListener=function(el,ev,fn,_878){
var l={el:el,ev:ev,fn:fn,params:_878};
$E.listeners.push(l);
var _87a=function(e){
if(!e){
var e=window.event;
}
fn.call(null,e,_878);
};
if(el.addEventListener){
el.addEventListener(ev,_87a,false);
return true;
}else{
if(el.attachEvent){
el.attachEvent("on"+ev,_87a);
return true;
}else{
return false;
}
}
};
$E.isListener=function(el,ev,fn,_87f){
var _880=false;
var ls=$E.listeners;
for(var i=0;i<ls.length;i++){
if(ls[i].el==el&&ls[i].ev==ev&&ls[i].fn==fn&&ls[i].params==_87f){
_880=true;
break;
}
}
return _880;
};
$E.callBindHandlers=function(id,_884,ev){
var el=document.getElementById(id);
if(!el){
return;
}
var ls=$E.listeners;
for(var i=0;i<ls.length;i++){
if(ls[i].el==el&&ls[i].ev==ev&&ls[i].fn._cf_bindhandler){
ls[i].fn.call(null,null,ls[i].params);
}
}
};
$E.registerOnLoad=function(func,_88a,_88b,user){
if($E.registerOnLoad.windowLoaded){
if(_88a&&_88a._cf_containerId&&$E.loadEvents[_88a._cf_containerId]){
if(user){
$E.loadEvents[_88a._cf_containerId].user.subscribe(func,_88a);
}else{
$E.loadEvents[_88a._cf_containerId].system.subscribe(func,_88a);
}
}else{
func.call(null,null,_88a);
}
}else{
if(user){
$E.windowLoadUserEvent.subscribe(func,_88a);
}else{
if(_88b){
$E.windowLoadImpEvent.subscribe(func,_88a);
}else{
$E.windowLoadEvent.subscribe(func,_88a);
}
}
}
};
$E.registerOnLoad.windowLoaded=false;
$E.onWindowLoad=function(fn){
if(window.addEventListener){
window.addEventListener("load",fn,false);
}else{
if(window.attachEvent){
window.attachEvent("onload",fn);
}else{
if(document.getElementById){
window.onload=fn;
}
}
}
};
$C.addSpanToDom=function(){
var _88e=document.createElement("span");
document.body.insertBefore(_88e,document.body.firstChild);
};
$E.windowLoadHandler=function(e){
if(window.Ext){
Ext.BLANK_IMAGE_URL=_cf_ajaxscriptsrc+"/resources/ext/images/default/s.gif";
}
$C.addSpanToDom();
$L.init();
$E.registerOnLoad.windowLoaded=true;
$E.windowLoadImpEvent.fire();
$E.windowLoadImpEvent.unsubscribe();
$E.windowLoadEvent.fire();
$E.windowLoadEvent.unsubscribe();
if(window.Ext){
Ext.onReady(function(){
$E.windowLoadUserEvent.fire();
});
}else{
$E.windowLoadUserEvent.fire();
}
$E.windowLoadUserEvent.unsubscribe();
};
$E.onWindowLoad($E.windowLoadHandler);
$B.register=function(_890,_891,_892,_893){
for(var i=0;i<_890.length;i++){
var _895=_890[i][0];
var _896=_890[i][1];
var _897=_890[i][2];
if(window[_895]){
var _898=eval(_895);
if(_898&&_898._cf_register){
_898._cf_register(_897,_892,_891);
continue;
}
}
var _899=$C.objectCache[_895];
if(_899&&_899._cf_register){
_899._cf_register(_897,_892,_891);
continue;
}
var _89a=$D.getElement(_895,_896);
var _89b=(_89a&&((!_89a.length&&_89a.length!=0)||(_89a.length&&_89a.length>0)||_89a.tagName=="SELECT"));
if(!_89b){
$C.handleError(null,"bind.register.elnotfound","bind",[_895]);
}
if(_89a.length>1&&!_89a.options){
for(var j=0;j<_89a.length;j++){
$B.register.addListener(_89a[j],_897,_892,_891);
}
}else{
$B.register.addListener(_89a,_897,_892,_891);
}
}
if(!$C.bindHandlerCache[_891.bindTo]&&typeof (_891.bindTo)=="string"){
$C.bindHandlerCache[_891.bindTo]=function(){
_892.call(null,null,_891);
};
}
if(_893){
_892.call(null,null,_891);
}
};
$B.register.addListener=function(_89d,_89e,_89f,_8a0){
if(!$E.isListener(_89d,_89e,_89f,_8a0)){
$E.addListener(_89d,_89e,_89f,_8a0);
}
};
$B.assignValue=function(_8a1,_8a2,_8a3,_8a4){
if(!_8a1){
return;
}
if(_8a1.call){
_8a1.call(null,_8a3,_8a4);
return;
}
var _8a5=$C.objectCache[_8a1];
if(_8a5&&_8a5._cf_setValue){
_8a5._cf_setValue(_8a3);
return;
}
var _8a6=document.getElementById(_8a1);
if(!_8a6){
$C.handleError(null,"bind.assignvalue.elnotfound","bind",[_8a1]);
}
if(_8a6.tagName=="SELECT"){
var _8a7=$U.checkQuery(_8a3);
var _8a8=$C.objectCache[_8a1];
if(_8a7){
if(!_8a8||(_8a8&&(!_8a8.valueCol||!_8a8.displayCol))){
$C.handleError(null,"bind.assignvalue.selboxmissingvaldisplay","bind",[_8a1]);
return;
}
}else{
if(typeof (_8a3.length)=="number"&&!_8a3.toUpperCase){
if(_8a3.length>0&&(typeof (_8a3[0].length)!="number"||_8a3[0].toUpperCase)){
$C.handleError(null,"bind.assignvalue.selboxerror","bind",[_8a1]);
return;
}
}else{
$C.handleError(null,"bind.assignvalue.selboxerror","bind",[_8a1]);
return;
}
}
_8a6.options.length=0;
var _8a9;
var _8aa=false;
if(_8a8){
_8a9=_8a8.selected;
if(_8a9&&_8a9.length>0){
_8aa=true;
}
}
if(!_8a7){
for(var i=0;i<_8a3.length;i++){
var opt=new Option(_8a3[i][1],_8a3[i][0]);
_8a6.options[i]=opt;
if(_8aa){
for(var j=0;j<_8a9.length;j++){
if(_8a9[j]==opt.value){
opt.selected=true;
}
}
}
}
}else{
if(_8a7=="col"){
var _8ae=_8a3.DATA[_8a8.valueCol];
var _8af=_8a3.DATA[_8a8.displayCol];
if(!_8ae||!_8af){
$C.handleError(null,"bind.assignvalue.selboxinvalidvaldisplay","bind",[_8a1]);
return;
}
for(var i=0;i<_8ae.length;i++){
var opt=new Option(_8af[i],_8ae[i]);
_8a6.options[i]=opt;
if(_8aa){
for(var j=0;j<_8a9.length;j++){
if(_8a9[j]==opt.value){
opt.selected=true;
}
}
}
}
}else{
if(_8a7=="row"){
var _8b0=-1;
var _8b1=-1;
for(var i=0;i<_8a3.COLUMNS.length;i++){
var col=_8a3.COLUMNS[i];
if(col==_8a8.valueCol){
_8b0=i;
}
if(col==_8a8.displayCol){
_8b1=i;
}
if(_8b0!=-1&&_8b1!=-1){
break;
}
}
if(_8b0==-1||_8b1==-1){
$C.handleError(null,"bind.assignvalue.selboxinvalidvaldisplay","bind",[_8a1]);
return;
}
for(var i=0;i<_8a3.DATA.length;i++){
var opt=new Option(_8a3.DATA[i][_8b1],_8a3.DATA[i][_8b0]);
_8a6.options[i]=opt;
if(_8aa){
for(var j=0;j<_8a9.length;j++){
if(_8a9[j]==opt.value){
opt.selected=true;
}
}
}
}
}
}
}
}else{
_8a6[_8a2]=_8a3;
}
$E.callBindHandlers(_8a1,null,"change");
$L.info("bind.assignvalue.success","bind",[_8a3,_8a1,_8a2]);
};
$B.localBindHandler=function(e,_8b4){
var _8b5=document.getElementById(_8b4.bindTo);
var _8b6=$B.evaluateBindTemplate(_8b4,true);
$B.assignValue(_8b4.bindTo,_8b4.bindToAttr,_8b6);
};
$B.localBindHandler._cf_bindhandler=true;
$B.evaluateBindTemplate=function(_8b7,_8b8,_8b9,_8ba,_8bb){
var _8bc=_8b7.bindExpr;
var _8bd="";
if(typeof _8bb=="undefined"){
_8bb=false;
}
for(var i=0;i<_8bc.length;i++){
if(typeof (_8bc[i])=="object"){
var _8bf=null;
if(!_8bc[i].length||typeof _8bc[i][0]=="object"){
_8bf=$X.JSON.encode(_8bc[i]);
}else{
var _8bf=$B.getBindElementValue(_8bc[i][0],_8bc[i][1],_8bc[i][2],_8b8,_8ba);
if(_8bf==null){
if(_8b8){
_8bd="";
break;
}else{
_8bf="";
}
}
}
if(_8b9){
_8bf=encodeURIComponent(_8bf);
}
_8bd+=_8bf;
}else{
var _8c0=_8bc[i];
if(_8bb==true&&i>0){
if(typeof (_8c0)=="string"&&_8c0.indexOf("&")!=0){
_8c0=encodeURIComponent(_8c0);
}
}
_8bd+=_8c0;
}
}
return _8bd;
};
$B.jsBindHandler=function(e,_8c2){
var _8c3=_8c2.bindExpr;
var _8c4=new Array();
var _8c5=_8c2.callFunction+"(";
for(var i=0;i<_8c3.length;i++){
var _8c7;
if(typeof (_8c3[i])=="object"){
if(_8c3[i].length){
if(typeof _8c3[i][0]=="object"){
_8c7=_8c3[i];
}else{
_8c7=$B.getBindElementValue(_8c3[i][0],_8c3[i][1],_8c3[i][2],false);
}
}else{
_8c7=_8c3[i];
}
}else{
_8c7=_8c3[i];
}
if(i!=0){
_8c5+=",";
}
_8c4[i]=_8c7;
_8c5+="'"+_8c7+"'";
}
_8c5+=")";
var _8c8=_8c2.callFunction.apply(null,_8c4);
$B.assignValue(_8c2.bindTo,_8c2.bindToAttr,_8c8,_8c2.bindToParams);
};
$B.jsBindHandler._cf_bindhandler=true;
$B.urlBindHandler=function(e,_8ca){
var _8cb=_8ca.bindTo;
if($C.objectCache[_8cb]&&$C.objectCache[_8cb]._cf_visible===false){
$C.objectCache[_8cb]._cf_dirtyview=true;
return;
}
var url=$B.evaluateBindTemplate(_8ca,false,true,false,true);
var _8cd=$U.extractReturnFormat(url);
if(_8cd==null||typeof _8cd=="undefined"){
_8cd="JSON";
}
if(_8ca.bindToAttr||typeof _8ca.bindTo=="undefined"||typeof _8ca.bindTo=="function"){
var _8ca={"bindTo":_8ca.bindTo,"bindToAttr":_8ca.bindToAttr,"bindToParams":_8ca.bindToParams,"errorHandler":_8ca.errorHandler,"url":url,returnFormat:_8cd};
try{
$A.sendMessage(url,"GET",null,true,$B.urlBindHandler.callback,_8ca);
}
catch(e){
$C.handleError(_8ca.errorHandler,"ajax.urlbindhandler.connectionerror","http",[url,e]);
}
}else{
$A.replaceHTML(_8cb,url,null,null,_8ca.callback,_8ca.errorHandler);
}
};
$B.urlBindHandler._cf_bindhandler=true;
$B.urlBindHandler.callback=function(req,_8cf){
if($A.isRequestError(req)){
$C.handleError(_8cf.errorHandler,"bind.urlbindhandler.httperror","http",[req.status,_8cf.url,req.statusText],req.status,req.statusText);
}else{
$L.info("bind.urlbindhandler.response","http",[req.responseText]);
var _8d0;
try{
if(_8cf.returnFormat==null||_8cf.returnFormat==="JSON"){
_8d0=$X.JSON.decode(req.responseText);
}else{
_8d0=req.responseText;
}
}
catch(e){
if(req.responseText!=null&&typeof req.responseText=="string"){
_8d0=req.responseText;
}else{
$C.handleError(_8cf.errorHandler,"bind.urlbindhandler.jsonerror","http",[req.responseText]);
}
}
$B.assignValue(_8cf.bindTo,_8cf.bindToAttr,_8d0,_8cf.bindToParams);
}
};
$A.initSelect=function(_8d1,_8d2,_8d3,_8d4){
$C.objectCache[_8d1]={"valueCol":_8d2,"displayCol":_8d3,selected:_8d4};
};
$S.setupSpry=function(){
if(typeof (Spry)!="undefined"&&Spry.Data){
Spry.Data.DataSet.prototype._cf_getAttribute=function(_8d5){
var val;
var row=this.getCurrentRow();
if(row){
val=row[_8d5];
}
return val;
};
Spry.Data.DataSet.prototype._cf_register=function(_8d8,_8d9,_8da){
var obs={bindParams:_8da};
obs.onCurrentRowChanged=function(){
_8d9.call(null,null,this.bindParams);
};
obs.onDataChanged=function(){
_8d9.call(null,null,this.bindParams);
};
this.addObserver(obs);
};
if(Spry.Debug.trace){
var _8dc=Spry.Debug.trace;
Spry.Debug.trace=function(str){
$L.info(str,"spry");
_8dc(str);
};
}
if(Spry.Debug.reportError){
var _8de=Spry.Debug.reportError;
Spry.Debug.reportError=function(str){
$L.error(str,"spry");
_8de(str);
};
}
$L.info("spry.setupcomplete","bind");
}
};
$E.registerOnLoad($S.setupSpry,null,true);
$S.bindHandler=function(_8e0,_8e1){
var url;
var _8e3="_cf_nodebug=true&_cf_nocache=true";
if(window._cf_clientid){
_8e3+="&_cf_clientid="+_cf_clientid;
}
var _8e4=window[_8e1.bindTo];
var _8e5=(typeof (_8e4)=="undefined");
if(_8e1.cfc){
var _8e6={};
var _8e7=_8e1.bindExpr;
for(var i=0;i<_8e7.length;i++){
var _8e9;
if(_8e7[i].length==2){
_8e9=_8e7[i][1];
}else{
_8e9=$B.getBindElementValue(_8e7[i][1],_8e7[i][2],_8e7[i][3],false,_8e5);
}
_8e6[_8e7[i][0]]=_8e9;
}
_8e6=$X.JSON.encode(_8e6);
_8e3+="&method="+_8e1.cfcFunction;
_8e3+="&argumentCollection="+encodeURIComponent(_8e6);
$L.info("spry.bindhandler.loadingcfc","http",[_8e1.bindTo,_8e1.cfc,_8e1.cfcFunction,_8e6]);
url=_8e1.cfc;
}else{
url=$B.evaluateBindTemplate(_8e1,false,true,_8e5);
$L.info("spry.bindhandler.loadingurl","http",[_8e1.bindTo,url]);
}
var _8ea=_8e1.options||{};
if((_8e4&&_8e4._cf_type=="json")||_8e1.dsType=="json"){
_8e3+="&returnformat=json";
}
if(_8e4){
if(_8e4.requestInfo.method=="GET"){
_8ea.method="GET";
if(url.indexOf("?")==-1){
url+="?"+_8e3;
}else{
url+="&"+_8e3;
}
}else{
_8ea.postData=_8e3;
_8ea.method="POST";
_8e4.setURL("");
}
_8e4.setURL(url,_8ea);
_8e4.loadData();
}else{
if(!_8ea.method||_8ea.method=="GET"){
if(url.indexOf("?")==-1){
url+="?"+_8e3;
}else{
url+="&"+_8e3;
}
}else{
_8ea.postData=_8e3;
_8ea.useCache=false;
}
var ds;
if(_8e1.dsType=="xml"){
ds=new Spry.Data.XMLDataSet(url,_8e1.xpath,_8ea);
}else{
ds=new Spry.Data.JSONDataSet(url,_8ea);
ds.preparseFunc=$S.preparseData;
}
ds._cf_type=_8e1.dsType;
var _8ec={onLoadError:function(req){
$C.handleError(_8e1.errorHandler,"spry.bindhandler.error","http",[_8e1.bindTo,req.url,req.requestInfo.postData]);
}};
ds.addObserver(_8ec);
window[_8e1.bindTo]=ds;
}
};
$S.bindHandler._cf_bindhandler=true;
$S.preparseData=function(ds,_8ef){
var _8f0=$U.getFirstNonWhitespaceIndex(_8ef);
if(_8f0>0){
_8ef=_8ef.slice(_8f0);
}
if(window._cf_jsonprefix&&_8ef.indexOf(_cf_jsonprefix)==0){
_8ef=_8ef.slice(_cf_jsonprefix.length);
}
return _8ef;
};
$P.init=function(_8f1){
$L.info("pod.init.creating","widget",[_8f1]);
var _8f2={};
_8f2._cf_body=_8f1+"_body";
$C.objectCache[_8f1]=_8f2;
};
$B.cfcBindHandler=function(e,_8f4){
var _8f5=(_8f4.httpMethod)?_8f4.httpMethod:"GET";
var _8f6={};
var _8f7=_8f4.bindExpr;
for(var i=0;i<_8f7.length;i++){
var _8f9;
if(_8f7[i].length==2){
_8f9=_8f7[i][1];
}else{
_8f9=$B.getBindElementValue(_8f7[i][1],_8f7[i][2],_8f7[i][3],false);
}
_8f6[_8f7[i][0]]=_8f9;
}
var _8fa=function(_8fb,_8fc){
$B.assignValue(_8fc.bindTo,_8fc.bindToAttr,_8fb,_8fc.bindToParams);
};
var _8fd={"bindTo":_8f4.bindTo,"bindToAttr":_8f4.bindToAttr,"bindToParams":_8f4.bindToParams};
var _8fe={"async":true,"cfcPath":_8f4.cfc,"httpMethod":_8f5,"callbackHandler":_8fa,"errorHandler":_8f4.errorHandler};
if(_8f4.proxyCallHandler){
_8fe.callHandler=_8f4.proxyCallHandler;
_8fe.callHandlerParams=_8f4;
}
$X.invoke(_8fe,_8f4.cfcFunction,_8f4._cf_ajaxproxytoken,_8f6,_8fd);
};
$B.cfcBindHandler._cf_bindhandler=true;
$U.extractReturnFormat=function(url){
var _900;
var _901=url.toUpperCase();
var _902=_901.indexOf("RETURNFORMAT");
if(_902>0){
var _903=_901.indexOf("&",_902+13);
if(_903<0){
_903=_901.length;
}
_900=_901.substring(_902+13,_903);
}
return _900;
};
$U.replaceAll=function(_904,_905,_906){
var _907=_904.indexOf(_905);
while(_907>-1){
_904=_904.replace(_905,_906);
_907=_904.indexOf(_905);
}
return _904;
};
$U.cloneObject=function(obj){
var _909={};
for(key in obj){
var _90a=obj[key];
if(typeof _90a=="object"){
_90a=$U.cloneObject(_90a);
}
_909.key=_90a;
}
return _909;
};
$C.clone=function(obj,_90c){
if(typeof (obj)!="object"){
return obj;
}
if(obj==null){
return obj;
}
var _90d=new Object();
for(var i in obj){
if(_90c===true){
_90d[i]=$C.clone(obj[i]);
}else{
_90d[i]=obj[i];
}
}
return _90d;
};
$C.printObject=function(obj){
var str="";
for(key in obj){
str=str+"  "+key+"=";
value=obj[key];
if(typeof (value)=="object"){
value=$C.printObject(value);
}
str+=value;
}
return str;
};
}
}
cfinit();
