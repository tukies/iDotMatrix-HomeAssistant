var O=globalThis,N=O.ShadowRoot&&(O.ShadyCSS===void 0||O.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,V=Symbol(),ie=new WeakMap,P=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==V)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(N&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=ie.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ie.set(t,e))}return e}toString(){return this.cssText}},re=r=>new P(typeof r=="string"?r:r+"",void 0,V),j=(r,...e)=>{let t=r.length===1?r[0]:e.reduce((s,i,o)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new P(t,r,V)},oe=(r,e)=>{if(N)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),i=O.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,r.appendChild(s)}},q=N?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return re(t)})(r):r;var{is:Ae,defineProperty:Ee,getOwnPropertyDescriptor:Ce,getOwnPropertyNames:Pe,getOwnPropertySymbols:ke,getPrototypeOf:ze}=Object,H=globalThis,ae=H.trustedTypes,De=ae?ae.emptyScript:"",Me=H.reactiveElementPolyfillSupport,k=(r,e)=>r,F={toAttribute(r,e){switch(e){case Boolean:r=r?De:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},le=(r,e)=>!Ae(r,e),ne={attribute:!0,type:String,converter:F,reflect:!1,useDefault:!1,hasChanged:le};Symbol.metadata??=Symbol("metadata"),H.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ne){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Ee(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:o}=Ce(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){let h=i?.call(this);o?.call(this,a),this.requestUpdate(e,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ne}static _$Ei(){if(this.hasOwnProperty(k("elementProperties")))return;let e=ze(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(k("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(k("properties"))){let t=this.properties,s=[...Pe(t),...ke(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(q(i))}else e!==void 0&&t.push(q(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return oe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:F).toAttribute(t,s.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,t){let s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:F;this._$Em=i;let h=a.fromAttribute(t,o.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(e,t,s,i=!1,o){if(e!==void 0){let a=this.constructor;if(i===!1&&(o=this[e]),s??=a.getPropertyOptions(e),!((s.hasChanged??le)(o,t)||s.useDefault&&s.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:o},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),o!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:a}=o,h=this[i];a!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,o,h)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};g.elementStyles=[],g.shadowRootOptions={mode:"open"},g[k("elementProperties")]=new Map,g[k("finalized")]=new Map,Me?.({ReactiveElement:g}),(H.reactiveElementVersions??=[]).push("2.1.2");var X=globalThis,ce=r=>r,L=X.trustedTypes,he=L?L.createPolicy("lit-html",{createHTML:r=>r}):void 0,ge="$lit$",v=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+v,Re=`<${fe}>`,x=document,D=()=>x.createComment(""),M=r=>r===null||typeof r!="object"&&typeof r!="function",Z=Array.isArray,Te=r=>Z(r)||typeof r?.[Symbol.iterator]=="function",G=`[ 	
\f\r]`,z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,pe=/>/g,b=RegExp(`>|${G}(?:([^\\s"'>=/]+)(${G}*=${G}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ue=/'/g,_e=/"/g,ye=/^(?:script|style|textarea|title)$/i,Q=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),c=Q(1),qe=Q(2),Fe=Q(3),S=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),me=new WeakMap,w=x.createTreeWalker(x,129);function ve(r,e){if(!Z(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return he!==void 0?he.createHTML(e):e}var Ue=(r,e)=>{let t=r.length-1,s=[],i,o=e===2?"<svg>":e===3?"<math>":"",a=z;for(let h=0;h<t;h++){let n=r[h],p,u,d=-1,m=0;for(;m<n.length&&(a.lastIndex=m,u=a.exec(n),u!==null);)m=a.lastIndex,a===z?u[1]==="!--"?a=de:u[1]!==void 0?a=pe:u[2]!==void 0?(ye.test(u[2])&&(i=RegExp("</"+u[2],"g")),a=b):u[3]!==void 0&&(a=b):a===b?u[0]===">"?(a=i??z,d=-1):u[1]===void 0?d=-2:(d=a.lastIndex-u[2].length,p=u[1],a=u[3]===void 0?b:u[3]==='"'?_e:ue):a===_e||a===ue?a=b:a===de||a===pe?a=z:(a=b,i=void 0);let y=a===b&&r[h+1].startsWith("/>")?" ":"";o+=a===z?n+Re:d>=0?(s.push(p),n.slice(0,d)+ge+n.slice(d)+v+y):n+v+(d===-2?h:y)}return[ve(r,o+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},R=class r{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let o=0,a=0,h=e.length-1,n=this.parts,[p,u]=Ue(e,t);if(this.el=r.createElement(p,s),w.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=w.nextNode())!==null&&n.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let d of i.getAttributeNames())if(d.endsWith(ge)){let m=u[a++],y=i.getAttribute(d).split(v),U=/([.?@])?(.*)/.exec(m);n.push({type:1,index:o,name:U[2],strings:y,ctor:U[1]==="."?W:U[1]==="?"?K:U[1]==="@"?J:E}),i.removeAttribute(d)}else d.startsWith(v)&&(n.push({type:6,index:o}),i.removeAttribute(d));if(ye.test(i.tagName)){let d=i.textContent.split(v),m=d.length-1;if(m>0){i.textContent=L?L.emptyScript:"";for(let y=0;y<m;y++)i.append(d[y],D()),w.nextNode(),n.push({type:2,index:++o});i.append(d[m],D())}}}else if(i.nodeType===8)if(i.data===fe)n.push({type:2,index:o});else{let d=-1;for(;(d=i.data.indexOf(v,d+1))!==-1;)n.push({type:7,index:o}),d+=v.length-1}o++}}static createElement(e,t){let s=x.createElement("template");return s.innerHTML=e,s}};function A(r,e,t=r,s){if(e===S)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl,o=M(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=A(r,i._$AS(r,e.values),i,s)),e}var B=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??x).importNode(t,!0);w.currentNode=i;let o=w.nextNode(),a=0,h=0,n=s[0];for(;n!==void 0;){if(a===n.index){let p;n.type===2?p=new T(o,o.nextSibling,this,e):n.type===1?p=new n.ctor(o,n.name,n.strings,this,e):n.type===6&&(p=new Y(o,this,e)),this._$AV.push(p),n=s[++h]}a!==n?.index&&(o=w.nextNode(),a++)}return w.currentNode=x,i}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},T=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),M(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Te(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=R.createElement(ve(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{let o=new B(i,this),a=o.u(this.options);o.p(t),this.T(a),this._$AH=o}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new R(e)),t}k(e){Z(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,i=0;for(let o of e)i===t.length?t.push(s=new r(this.O(D()),this.O(D()),this,this.options)):s=t[i],s._$AI(o),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=ce(e).nextSibling;ce(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,o){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=l}_$AI(e,t=this,s,i){let o=this.strings,a=!1;if(o===void 0)e=A(this,e,t,0),a=!M(e)||e!==this._$AH&&e!==S,a&&(this._$AH=e);else{let h=e,n,p;for(e=o[0],n=0;n<o.length-1;n++)p=A(this,h[s+n],t,n),p===S&&(p=this._$AH[n]),a||=!M(p)||p!==this._$AH[n],p===l?e=l:e!==l&&(e+=(p??"")+o[n+1]),this._$AH[n]=p}a&&!i&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},W=class extends E{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},K=class extends E{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},J=class extends E{constructor(e,t,s,i,o){super(e,t,s,i,o),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??l)===S)return;let s=this._$AH,i=e===l&&s!==l||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==l&&(s===l||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Y=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var Oe=X.litHtmlPolyfillSupport;Oe?.(R,T),(X.litHtmlVersions??=[]).push("3.3.3");var $e=(r,e,t)=>{let s=t?.renderBefore??e,i=s._$litPart$;if(i===void 0){let o=t?.renderBefore??null;s._$litPart$=i=new T(e.insertBefore(D(),o),o,void 0,t??{})}return i._$AI(r),i};var ee=globalThis,$=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=$e(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};$._$litElement$=!0,$.finalized=!0,ee.litElementHydrateSupport?.({LitElement:$});var Ne=ee.litElementPolyfillSupport;Ne?.({LitElement:$});(ee.litElementVersions??=[]).push("4.2.2");var He=0,be=()=>globalThis.crypto?.randomUUID?.()||`layer-${Date.now()}-${He++}`,we="1.4.2",f=["designer","displays","gifs","messages"],_={clock:{label:"Clock",service:"show_clock",stop:"stop_clock",fields:[],note:"Pixel, analog, or a clock rendered by the panel itself."},weather:{label:"Weather",service:"show_weather",stop:"stop_weather",fields:[["weather_entity","Weather entity","weather"],["temperature_entity","Temperature override","sensor"],["condition_entity","Condition override","sensor"],["humidity_entity","Humidity override","sensor"],["wind_entity","Wind override","sensor"],["high_entity","High temperature override","sensor"],["low_entity","Low temperature override","sensor"]],note:"Use a weather entity, sensor overrides, or both."},co2:{label:"CO\u2082",service:"show_co2",stop:"stop_co2",fields:[["co2_entity","CO\u2082 sensor","sensor",!0]],note:"A live concentration gauge in parts per million."},power:{label:"Power",service:"show_power",stop:"stop_power",fields:[["power_entity","Power sensor","sensor",!0],["heat_entity","Heating thermostat","climate"],["cool_entity","Cooling thermostat","climate"]],note:"Household power use, with optional heating and cooling indicators."},thermostat:{label:"Thermostats",service:"show_thermostat",stop:"stop_thermostat",fields:[["heat_entity","Heating thermostat","climate"],["cool_entity","Cooling thermostat","climate"]],note:"Choose at least one heating or cooling thermostat."},bitcoin:{label:"Bitcoin",service:"show_bitcoin",stop:"stop_bitcoin",fields:[["price_entity","Price sensor (USD)","sensor",!0],["change_entity","24-hour change sensor (%)","sensor"]],note:"Display the price and optional daily change from your sensors."},sun:{label:"Sun",service:"show_sun",stop:"stop_sun",fields:[],note:"Sunrise, sunset, and daylight for your Home Assistant home location."},moon:{label:"Moon",service:"show_moon",stop:"stop_moon",fields:[],note:"Moon phase and illumination. No sensor required."},color:{label:"Solid color",service:"show_color",fields:[],note:"Fill the panel with a color. Choose black to clear it."}},xe=["alert","bell","bolt","car","check","coffee","cross","dog","door","drop","flame","gift","heart","home","info","mail","moon","music","package","phone","snowflake","star","sun","timer"];function te(r){return"#"+(Array.isArray(r)&&r.length===3?r:[255,255,255]).map(t=>Math.min(255,Math.max(0,Math.round(Number(t))||0)).toString(16).padStart(2,"0")).join("")}function C(r){return/^#[a-f\d]{6}$/i.test(r)?[1,3,5].map(e=>parseInt(r.slice(e,e+2),16)):[255,255,255]}function I(r){let e=new Set;return r.map(t=>{let s=String(t.id||be());return e.has(s)&&(s=be()),e.add(s),{...t,id:s,template:t.template??"",icon_template:t.icon_template??"",x:t.x??0,y:t.y??0,font_size:t.font_size??10,icon_size:t.icon_size??16,color:C(te(t.color)),is_template:!0}})}function Se(r,e,t){if(!_[r])throw new Error("Choose a display mode.");if(r==="color")return{color:C(e.color||"#3399ff")};if(![32,64].includes(t))throw new Error("These dashboards need a 32\xD732 or 64\xD764 panel.");let s={pixel_size:t,follow:e.follow??!0};for(let[i,o,,a]of _[r].fields){let h=(e[i]||"").trim();if(a&&!h)throw new Error(`Choose ${o.toLowerCase()}.`);h&&(s[i]=h)}if(r==="weather"&&!s.weather_entity&&!s.temperature_entity&&!s.condition_entity)throw new Error("Choose a weather entity or a temperature/condition sensor.");if(r==="thermostat"&&!s.heat_entity&&!s.cool_entity)throw new Error("Choose at least one thermostat.");return r==="clock"&&Object.assign(s,{face:e.face??"pixel",hour24:e.hour24??!0,show_date:e.show_date??!0,...e.color?{color:C(e.color)}:{}}),r==="sun"&&(s.hour24=e.hour24??!0),s}var se=class extends ${static properties={hass:{attribute:!1},config:{attribute:!1},_layers:{state:!0},_view:{state:!0},_size:{state:!0},_trigger:{state:!0},_fonts:{state:!0},_designs:{state:!0},_name:{state:!0},_preview:{state:!0},_previewError:{state:!0},_previewPending:{state:!0},_busy:{state:!0},_status:{state:!0},_error:{state:!0},_mode:{state:!0},_values:{state:!0},_gifPath:{state:!0},_interval:{state:!0},_message:{state:!0},_confirmDelete:{state:!0}};static styles=j`
    :host {
      container-type: inline-size;
      display: block;
      min-width: 0;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, inherit);
      font-size: 14px;
      line-height: 1.5;
    }
    * {
      box-sizing: border-box;
    }
    ha-card {
      display: block;
      padding: 20px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border: 1px solid var(--divider-color, #ddd);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }
    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
    }
    .muted,
    .hint {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
    }
    .hint {
      margin: 6px 0 0;
    }
    .size {
      width: 110px;
      flex-shrink: 0;
    }
    nav {
      display: flex;
      border-bottom: 1px solid var(--divider-color, #ddd);
      margin-bottom: 20px;
      gap: 4px;
    }
    nav button {
      border: 0;
      border-radius: 0;
      background: none;
      padding: 10px 8px;
      flex: 1;
      color: var(--secondary-text-color, #666);
      border-bottom: 2px solid transparent;
      font-size: 13px;
    }
    nav button[aria-selected="true"] {
      color: var(--primary-text-color, #212121);
      border-bottom-color: var(--primary-color, #03a9f4);
      font-weight: 600;
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px;
    }
    p {
      margin: 0 0 14px;
    }
    .row,
    .actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .actions {
      margin-top: 16px;
    }
    .actions > button {
      flex: 1;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .wide {
      grid-column: 1/-1;
    }
    label {
      display: grid;
      gap: 5px;
      min-width: 0;
      font-size: 12px;
      color: var(--secondary-text-color, #666);
    }
    input,
    select,
    textarea,
    button {
      font: inherit;
      color: var(--primary-text-color, #212121);
    }
    input,
    select,
    textarea {
      width: 100%;
      min-width: 0;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 6px;
      background: var(--card-background-color, #fff);
      padding: 9px 10px;
      min-height: 40px;
      font-size: 14px;
    }
    textarea {
      resize: vertical;
      min-height: 74px;
      line-height: 1.5;
    }
    textarea.template {
      font-family: ui-monospace, monospace;
      font-size: 13px;
    }
    input[type="color"] {
      padding: 3px;
      min-width: 44px;
    }
    input[type="range"] {
      padding: 0;
      border: 0;
    }
    input[type="checkbox"] {
      width: 18px;
      min-height: 18px;
      margin: 0;
      accent-color: var(--primary-color, #03a9f4);
    }
    .check {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin-top: 12px;
      color: var(--primary-text-color, #212121);
    }
    button {
      cursor: pointer;
      background: transparent;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 6px;
      padding: 9px 12px;
      min-height: 40px;
      line-height: 1.3;
    }
    button.primary {
      background: var(--idotmatrix-button-background, #0277bd);
      color: var(--idotmatrix-button-color, #fff);
      border-color: var(--idotmatrix-button-background, #0277bd);
    }
    button:hover:not(:disabled) {
      filter: brightness(0.94);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    button.danger {
      color: var(--error-color, #c62828);
    }
    button.small {
      font-size: 12px;
      padding: 5px 9px;
      min-height: 34px;
    }
    :is(button, input, select, textarea, summary):focus-visible {
      outline: 2px solid var(--primary-color, #0288d1);
      outline-offset: 3px;
    }
    @container (min-width: 650px) {
      .designer-layout {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }
      .layers-block .layer:first-child {
        border-top: 0;
        padding-top: 0;
      }
    }
    .preview {
      max-width: 256px;
      width: 100%;
      aspect-ratio: 1;
      margin: 0 auto;
      background: #000;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 6px;
      overflow: hidden;
      display: grid;
      place-items: center;
    }
    .preview img {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      object-fit: contain;
    }
    .preview .hint {
      color: #aaa;
      padding: 20px;
      text-align: center;
    }
    .preview-caption {
      text-align: center;
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      margin: 8px 0 16px;
      min-height: 18px;
    }
    .layer {
      border-top: 1px solid var(--divider-color, #ddd);
      padding: 16px 0;
    }
    .layer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }
    .layer-head strong {
      font-size: 14px;
    }
    .layer-head .row {
      gap: 4px;
    }
    .numbers {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .empty {
      padding: 24px 0;
      text-align: center;
      color: var(--secondary-text-color, #666);
    }
    details {
      border-top: 1px solid var(--divider-color, #ddd);
      margin-top: 16px;
      padding-top: 12px;
    }
    summary {
      cursor: pointer;
      font-weight: 500;
      padding: 4px 0;
      min-height: 36px;
    }
    details > .grid,
    details > .row {
      margin-top: 10px;
    }
    .status {
      border-left: 3px solid var(--primary-color, #03a9f4);
      padding: 8px 10px;
      margin: 16px 0 0;
      font-size: 13px;
      overflow-wrap: anywhere;
    }
    .status.error {
      border-color: var(--error-color, #c62828);
      color: var(--error-color, #c62828);
    }
    .connection {
      font-size: 12px;
    }
    .connection .actions {
      margin-top: 4px;
    }
    .mode-note {
      color: var(--secondary-text-color, #666);
      font-size: 13px;
      margin: 10px 0 16px;
    }
    .confirm {
      margin-top: 12px;
    }
    .confirm p {
      margin-bottom: 6px;
    }
    @media (max-width: 420px) {
      ha-card {
        padding: 14px;
      }
      .header h2 {
        font-size: 18px;
      }
      .size {
        width: 100px;
      }
      nav {
        gap: 0;
      }
      nav button {
        padding: 10px 4px;
        font-size: 12px;
      }
      .numbers {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .grid {
        grid-template-columns: 1fr;
      }
      .actions > button {
        min-width: 100px;
      }
      .layer-head {
        align-items: flex-start;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
      }
    }
  `;constructor(){super(),Object.assign(this,{_layers:[],_view:"designer",_size:32,_trigger:"",_fonts:[{filename:"Rain-DRM3.otf",name:"Rain DRM3"}],_designs:{},_name:"",_preview:"",_previewError:"",_previewPending:!1,_busy:"",_status:"",_error:!1,_mode:"clock",_values:{},_gifPath:"",_interval:5,_message:{message:"",style:"card",font:"pixel",duration:15,rainbow:!1,color:"#ffffff",icon:""},_confirmDelete:!1}),this._subscriptions=new Map,this._connection=null,this._previewSerial=0}setConfig(e){if(!e||typeof e!="object")throw new Error("Card configuration is required.");let t=Number(e.screen_size??32);if(![16,32,64].includes(t))throw new Error("screen_size must be 16, 32, or 64.");if(e.layers!==void 0&&!Array.isArray(e.layers))throw new Error("layers must be a list.");this.config={...e},this._size=t,this._trigger=e.trigger_entity||"",this._layers=I(e.layers??[{template:e.template??"{{ now().strftime('%H:%M') }}",x:e.x??0,y:e.y??8,color:[0,255,0],font_size:10}]),this._view=f.includes(e.default_view)?e.default_view:"designer",this._gifPath=e.gif_path??"",this._interval=e.gif_interval??5,this._mode=_[e.default_mode]?e.default_mode:"clock",this._values=structuredClone(e.display_options||{})}static getConfigForm(){return{schema:[{name:"title",selector:{text:{}}},{name:"screen_size",selector:{select:{options:["16","32","64"]}}},{name:"default_view",selector:{select:{options:f}}},{name:"trigger_entity",selector:{entity:{}}},{name:"gif_path",selector:{text:{}}},{name:"default_mode",selector:{select:{options:Object.keys(_)}}},{name:"display_options",selector:{object:{}}},{name:"mac_address",selector:{text:{}}}],computeLabel:e=>({title:"Card title",screen_size:"Panel resolution",default_view:"Default section",trigger_entity:"Designer refresh entity",gif_path:"Default GIF path",default_mode:"Default display mode",display_options:"Display defaults (by mode)",mac_address:"Panel MAC address (leave empty to address all connected panels)"})[e.name]||e.name}}static getStubConfig(){return{title:"iDotMatrix",screen_size:32,default_view:"designer",mac_address:""}}connectedCallback(){super.connectedCallback(),this.requestUpdate("hass")}disconnectedCallback(){super.disconnectedCallback(),this._cleanup()}_cleanup(){for(let e of this._subscriptions.values())e.unsub?.();this._subscriptions.clear(),this._connection=null,clearTimeout(this._previewTimer),this._previewSerial++}updated(e){if(!this.isConnected)return;for(let s of this.renderRoot.querySelectorAll("select")){let i=s.querySelector("option[selected]");i&&(s.value=i.value)}let t=this.hass?.connection;t!==this._connection&&(this._cleanup(),this._connection=t,t&&(this._fetchResources(t),this._syncSubscriptions(),this._queuePreview())),e.has("_layers")&&(this._syncSubscriptions(),this._queuePreview()),(e.has("_size")||e.has("_view"))&&this._queuePreview()}async _fetchResources(e){try{let[t,s]=await Promise.all([e.sendMessagePromise({type:"call_service",domain:"idotmatrix",service:"list_fonts",service_data:{},return_response:!0}),e.sendMessagePromise({type:"idotmatrix/list_designs"})]);if(this._connection!==e)return;t?.response?.fonts?.length&&(this._fonts=t.response.fonts),this._designs=s.designs||{}}catch(t){this._connection===e&&this._notify(`Could not load saved designs or fonts: ${t.message||t}`,!0)}}_syncSubscriptions(){let e=new Map;for(let t of this._layers)for(let s of["template","icon_template","condition_template"])t[s]&&e.set(`${t.id}:${s}`,t[s]);for(let[t,s]of this._subscriptions)(e.get(t)!==s.template||s.connection!==this._connection)&&(s.unsub?.(),this._subscriptions.delete(t));if(!(!this._connection||!this.isConnected))for(let[t,s]of e){if(this._subscriptions.has(t))continue;let i={template:s,connection:this._connection};this._subscriptions.set(t,i),Promise.resolve(this._connection.subscribeMessage(o=>{if(this._subscriptions.get(t)!==i)return;let a=JSON.stringify(o);a!==i.result&&(i.result=a,this._queuePreview())},{type:"render_template",template:s,variables:{}})).then(o=>{this._subscriptions.get(t)!==i||!this.isConnected?o():i.unsub=o}).catch(o=>{this._subscriptions.get(t)===i&&(this._subscriptions.delete(t),this._previewError=`Template subscription failed: ${o.message||o}`)})}}_queuePreview(){clearTimeout(this._previewTimer),this._previewSerial++,!(this._view!=="designer"||!this._connection||!this.isConnected)&&(this._previewTimer=setTimeout(()=>this._renderPreview(),180))}async _renderPreview(){let e=++this._previewSerial,t=this._connection;if(!(!t||!this.isConnected)){this._previewPending=!0;try{let s=await t.sendMessagePromise({type:"call_service",domain:"idotmatrix",service:"render_preview",service_data:{face:{layers:this._layers},screen_size:this._size},return_response:!0});if(e!==this._previewSerial||!this.isConnected)return;let i=s?.response;if(!i?.image)throw new Error(i?.error||"No preview returned");this._preview=i.image,this._previewError=""}catch(s){e===this._previewSerial&&(this._previewError=`Preview unavailable: ${s.message||s}`)}finally{e===this._previewSerial&&(this._previewPending=!1)}}}_notify(e,t=!1){this._status=e,this._error=t}_hasService(e){return!!(this.hass?.connection&&(!this.hass.services||this.hass.services.idotmatrix?.[e]))}async _call(e,t={}){if(!this._hasService(e))throw new Error(`The ${e} action is unavailable. Update or enable the iDotMatrix integration.`);let s={...t};return this.config.mac_address&&(s.mac_address=this.config.mac_address),this.hass.callService("idotmatrix",e,s)}async _run(e,t,s){if(this._busy)return!1;this._busy=e,this._notify(e);try{return await t(),this._notify(s),!0}catch(i){return this._notify(i.message||String(i),!0),!1}finally{this._busy=""}}_changeView(e){this._view=e,this._confirmDelete=!1,this._busy||(this._status="")}_tabKey(e,t){let s=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!s&&e.key!=="Home"&&e.key!=="End")return;e.preventDefault();let i=e.key==="Home"?0:e.key==="End"?f.length-1:(t+s+f.length)%f.length;this._changeView(f[i]),this.updateComplete.then(()=>this.renderRoot.querySelector(`#tab-${f[i]}`).focus())}_updateLayer(e,t,s){let i=this._layers.map(o=>({...o}));i[e][t]=s,t==="template"&&delete i[e].content,this._layers=i}_removeLayer(e){this._layers=this._layers.filter((t,s)=>s!==e)}_moveLayer(e,t){let s=[...this._layers];[s[e],s[e+t]]=[s[e+t],s[e]],this._layers=s}_addLayer(){this._layers=I([...this._layers,{template:"",x:0,y:0,color:[255,255,255],font_size:10}])}async _saveToDevice(){return this._run("Sending design\u2026",()=>this._call("set_face",{face:{layers:this._layers,screen_size:this._size,trigger_entity:this._trigger||null}}),"Design sent to the panel.")}async _saveDesign(){let e=this._name.trim();return e?this._run("Saving design\u2026",async()=>{await this._connection.sendMessagePromise({type:"idotmatrix/save_design",name:e,layers:this._layers,screen_size:this._size,trigger_entity:this._trigger||null});let t=await this._connection.sendMessagePromise({type:"idotmatrix/list_designs"});this._designs=t.designs||{},this._name=e},"Design saved."):(this._notify("Enter a name for this design.",!0),!1)}_loadDesign(e){let t=this._designs[e];t&&(this._name=e,this._layers=I(t.layers||[]),[16,32,64].includes(t.screen_size)&&(this._size=t.screen_size),this._trigger=t.trigger_entity||"",this._confirmDelete=!1,this._notify("Design loaded. Send it when ready."))}async _deleteDesign(){let e=this._name;return this._run("Deleting design\u2026",async()=>{await this._connection.sendMessagePromise({type:"idotmatrix/delete_design",name:e}),this._designs={...this._designs},delete this._designs[e],this._name="",this._confirmDelete=!1},"Saved design deleted.")}_setValue(e,t){this._values={...this._values,[this._mode]:{...this._values[this._mode],[e]:t}}}async _sendDisplay(){if(this.renderRoot.querySelector("#display-form")?.reportValidity())return this._run("Updating display\u2026",()=>this._call(_[this._mode].service,Se(this._mode,this._values[this._mode]||{},this._size)),`${_[this._mode].label} sent to the panel.`)}async _sendGif(){if(this.renderRoot.querySelector("#gif-form")?.reportValidity())return this._run("Uploading GIFs\u2026",()=>this._call("display_gif",{path:this._gifPath.trim(),rotation_interval:Number(this._interval)}),"GIF upload complete.")}async _sendMessage(){if(this.renderRoot.querySelector("#message-form")?.reportValidity())return this._run("Sending message\u2026",()=>{if(![32,64].includes(this._size))throw new Error("Messages need a 32\xD732 or 64\xD764 panel.");let e={...this._message,message:this._message.message.trim(),duration:Number(this._message.duration),color:C(this._message.color),pixel_size:this._size};if(!e.message)throw new Error("Enter a message.");return e.icon||delete e.icon,this._call("show_message",e)},"Message sent to the panel.")}_messageValue(e,t){this._message={...this._message,[e]:t}}_entityField(e,t,s,i=!1,o=this._values[this._mode]||{}){return c`<label
      >${t}${i?" *":""}<input
        type="text"
        list=${`entities-${s}`}
        .value=${o[e]||""}
        ?required=${i}
        placeholder=${`${s}.\u2026`}
        @input=${a=>this._setValue(e,a.target.value)}
    /></label>`}_color(e,t,s){return c`<label
      >${e}<input
        type="color"
        .value=${t||"#ffffff"}
        @input=${i=>s(i.target.value)}
    /></label>`}_check(e,t,s){return c`<label class="check"
      ><input
        type="checkbox"
        .checked=${t}
        @change=${i=>s(i.target.checked)}
      />${e}</label
    >`}_number(e,t,s,i,o,a){return c`<label
      >${i}<input
        type="number"
        min=${o}
        max=${a}
        .value=${String(t[s]??(s==="font_size"?10:s==="icon_size"?16:0))}
        @change=${h=>this._updateLayer(e,s,Math.min(a,Math.max(o,Number(h.target.value)||0)))}
    /></label>`}_designer(){return c` <div class="designer-layout">
      <div class="preview-block">
        <div
          class="preview"
          role="img"
          aria-label=${`Design preview at ${this._size} by ${this._size} pixels`}
        >
          ${this._preview?c`<img src=${this._preview} alt="Rendered design preview" />`:c`<span class="hint">${this._previewError||"Preparing preview\u2026"}</span>`}
        </div>
        <div class="preview-caption" role="status">
          ${this._previewError||(this._previewPending?"Updating preview\u2026":`${this._size} \xD7 ${this._size} \xB7 rendered by Home Assistant`)}
        </div>
      </div>
      <div class="layers-block">
        ${this._layers.length?this._layers.map((e,t)=>c`<section
                    class="layer"
                    aria-label=${`Layer ${t+1}`}
                  >
                    <div class="layer-head">
                      <strong>Layer ${t+1}</strong>
                      <div class="row">
                        <button
                          class="small"
                          aria-label=${`Move layer ${t+1} up`}
                          ?disabled=${t===0}
                          @click=${()=>this._moveLayer(t,-1)}
                        >
                          ↑</button
                        ><button
                          class="small"
                          aria-label=${`Move layer ${t+1} down`}
                          ?disabled=${t===this._layers.length-1}
                          @click=${()=>this._moveLayer(t,1)}
                        >
                          ↓</button
                        ><button
                          class="small danger"
                          aria-label=${`Remove layer ${t+1}`}
                          @click=${()=>this._removeLayer(t)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <label
                      >Text or Jinja template<textarea
                        class="template"
                        .value=${e.template}
                        @input=${s=>this._updateLayer(t,"template",s.target.value)}
                      ></textarea>
                    </label>
                    <div class="grid" style="margin-top:12px">
                      <label
                        >Icon or icon template<input
                          placeholder="mdi:weather-sunny"
                          .value=${e.icon_template}
                          @input=${s=>this._updateLayer(t,"icon_template",s.target.value)} /></label
                      >${this._color("Text and icon color",te(e.color),s=>this._updateLayer(t,"color",C(s)))}
                    </div>
                    <details>
                      <summary>Position and typography</summary>
                      <div class="numbers">
                        ${this._number(t,e,"x","X position",-64,64)}${this._number(t,e,"y","Y position",-64,64)}${this._number(t,e,"font_size","Font size",1,64)}${this._number(t,e,"icon_size","Icon size",1,64)}${this._number(t,e,"spacing_x","Letter spacing",-8,20)}
                      </div>
                      <div class="grid" style="margin-top:12px">
                        <label
                          >Font<select
                            .value=${e.font||"Rain-DRM3.otf"}
                            @change=${s=>this._updateLayer(t,"font",s.target.value)}
                          >
                            ${this._fonts.map(s=>c`<option value=${s.filename} ?selected=${s.filename===(e.font||"Rain-DRM3.otf")}>${s.name}</option>`)}
                          </select></label
                        ><label
                          >Sharpness / blur · ${e.blur??5}<input
                            type="range"
                            min="0"
                            max="10"
                            .value=${String(e.blur??5)}
                            @input=${s=>this._updateLayer(t,"blur",Number(s.target.value))}
                        /></label>
                      </div>
                    </details>
                  </section>`):c`<p class="empty">No layers. Add one to start a design.</p>`}
        <div class="actions">
          <button @click=${this._addLayer}>Add layer</button
          ><button
            class="primary"
            ?disabled=${!!this._busy||!this._hasService("set_face")}
            @click=${this._saveToDevice}
          >
            Send design
          </button>
        </div>
        <details>
          <summary>Auto-refresh</summary>
          <label
            >Refresh when this entity changes<input
              list="entities-all"
              .value=${this._trigger}
              placeholder="sensor.time"
              @input=${e=>this._trigger=e.target.value}
          /></label>
          <p class="hint">
            The panel also follows entities referenced by your templates.
          </p>
        </details>
        <details>
          <summary>Saved designs</summary>
          <div class="grid">
            <label
              >Load a design<select
                .value=${""}
                @change=${e=>{this._loadDesign(e.target.value),e.target.value=""}}
              >
                <option value="">Choose a saved design</option>
                ${Object.keys(this._designs).sort().map(e=>c`<option value=${e}>${e}</option>`)}
              </select></label
            ><label
              >Design name<input
                .value=${this._name}
                @input=${e=>{this._name=e.target.value,this._confirmDelete=!1}}
            /></label>
          </div>
          <div class="actions">
            <button ?disabled=${!!this._busy} @click=${this._saveDesign}>
              Save design</button
            ><button
              class="danger"
              ?disabled=${!!this._busy||!this._designs[this._name]}
              @click=${()=>this._confirmDelete=!0}
            >
              Delete saved design
            </button>
          </div>
          ${this._confirmDelete?c`<div class="confirm">
                  <p>Delete “${this._name}” from saved designs?</p>
                  <div class="row">
                    <button class="danger" @click=${this._deleteDesign}>
                      Confirm delete</button
                    ><button @click=${()=>this._confirmDelete=!1}>
                      Cancel
                    </button>
                  </div>
                </div>`:l}
        </details>
      </div>
    </div>`}_displays(){let e=_[this._mode],t=this._values[this._mode]||{};return c`<form
      id="display-form"
      @submit=${s=>{s.preventDefault(),this._sendDisplay()}}
    >
      <label
        >Display mode<select
          .value=${this._mode}
          @change=${s=>{this._mode=s.target.value,this._busy||(this._status="")}}
        >
          ${Object.entries(_).map(([s,i])=>c`<option value=${s} ?selected=${s===this._mode}>${i.label}</option>`)}
        </select></label
      >
      <p class="mode-note">${e.note}</p>
      <div class="grid">
        ${(this._mode==="weather"?e.fields.slice(0,1):e.fields).map(s=>this._entityField(...s))}${this._mode==="clock"?c`<label
                >Clock face<select
                  .value=${t.face??"pixel"}
                  @change=${s=>this._setValue("face",s.target.value)}
                >
                  <option
                    value="pixel"
                    ?selected=${(t.face??"pixel")==="pixel"}
                  >
                    Pixel
                  </option>
                  <option value="analog" ?selected=${t.face==="analog"}>
                    Analog
                  </option>
                  ${Array.from({length:8},(s,i)=>c`<option value=${String(i)} ?selected=${String(t.face)===String(i)}>Native ${i}</option>`)}
                </select></label
              >`:l}${["color","clock"].includes(this._mode)?this._color(this._mode==="color"?"Panel color":"Clock accent",t.color||"#3399ff",s=>this._setValue("color",s)):l}
      </div>
      ${this._mode==="weather"?c`<details>
              <summary>Sensor overrides</summary>
              <div class="grid">
                ${e.fields.slice(1).map(s=>this._entityField(...s))}
              </div>
            </details>`:l}${["clock","sun"].includes(this._mode)?this._check("24-hour time",t.hour24??!0,s=>this._setValue("hour24",s)):l}${this._mode==="clock"?this._check("Show date",t.show_date??!0,s=>this._setValue("show_date",s)):l}${this._mode!=="color"?this._check("Keep automatically updated",t.follow??!0,s=>this._setValue("follow",s)):l}
      <div class="actions">
        <button
          type="submit"
          class="primary"
          ?disabled=${!!this._busy||!this._hasService(e.service)}
        >
          Show ${e.label.toLowerCase()}</button
        >${e.stop?c`<button type="button" ?disabled=${!!this._busy||!this._hasService(e.stop)} @click=${()=>this._run("Stopping updates\u2026",()=>this._call(e.stop),"Automatic updates stopped.")}>Stop updates</button>`:l}
      </div>
    </form>`}_gifs(){return c`<h3>GIFs and carousels</h3>
      <p class="mode-note">
        Send one file, or a folder of up to 12 randomly selected GIFs. Prepare
        GIFs at your panel’s resolution.
      </p>
      <form
        id="gif-form"
        @submit=${e=>{e.preventDefault(),this._sendGif()}}
      >
        <label
          >GIF file or folder path<input
            required
            .value=${this._gifPath}
            placeholder="/media/idotmatrix/gifs/"
            @input=${e=>this._gifPath=e.target.value} /></label
        ><label style="margin-top:12px"
          >Carousel interval (seconds)<input
            required
            type="number"
            min="1"
            max="255"
            .value=${String(this._interval)}
            @input=${e=>this._interval=e.target.value}
        /></label>
        <p class="hint">
          Applies to folders. The panel loops the uploaded GIFs itself.
        </p>
        <div class="actions">
          <button
            type="submit"
            class="primary"
            ?disabled=${!!this._busy||!this._hasService("display_gif")}
          >
            Send GIFs</button
          ><button
            type="button"
            ?disabled=${!!this._busy||!this._hasService("stop_gif_rotation")}
            @click=${()=>this._run("Stopping GIFs\u2026",()=>this._call("stop_gif_rotation"),"GIF display stopped.")}
          >
            Stop GIFs
          </button>
        </div>
      </form>`}_messages(){let e=this._message;return c`<h3>Send a message</h3>
      <p class="mode-note">
        Temporarily replace the current dashboard. It returns when the message
        finishes.
      </p>
      <form
        id="message-form"
        @submit=${t=>{t.preventDefault(),this._sendMessage()}}
      >
        <label
          >Message<textarea
            required
            .value=${e.message}
            placeholder="Front door open"
            @input=${t=>this._messageValue("message",t.target.value)}
          ></textarea>
        </label>
        <div class="grid" style="margin-top:12px">
          <label
            >Style<select
              .value=${e.style}
              @change=${t=>this._messageValue("style",t.target.value)}
            >
              ${["card","alert","marquee","party","typewriter"].map(t=>c`<option value=${t} ?selected=${t===e.style}>${t[0].toUpperCase()+t.slice(1)}</option>`)}
            </select></label
          ><label
            >Icon<select
              .value=${e.icon}
              @change=${t=>this._messageValue("icon",t.target.value)}
            >
              <option value="">No icon</option>
              ${xe.map(t=>c`<option value=${t} ?selected=${t===e.icon}>${t}</option>`)}
            </select></label
          ><label
            >Font<select
              .value=${e.font}
              @change=${t=>this._messageValue("font",t.target.value)}
            >
              <option value="pixel" ?selected=${e.font==="pixel"}>
                Pixel
              </option>
              <option value="arcade" ?selected=${e.font==="arcade"}>
                Arcade
              </option>
              <option value="tiny" ?selected=${e.font==="tiny"}>Tiny</option>
            </select></label
          ><label
            >Duration (seconds)<input
              type="number"
              required
              min="0"
              max="3600"
              .value=${String(e.duration)}
              @input=${t=>this._messageValue("duration",t.target.value)} /></label
          >${this._color("Message color",e.color,t=>this._messageValue("color",t))}
        </div>
        ${this._check("Rainbow text",e.rainbow,t=>this._messageValue("rainbow",t))}
        <p class="hint">
          Set duration to 0 to keep the message until you stop it.
        </p>
        <div class="actions">
          <button
            type="submit"
            class="primary"
            ?disabled=${!!this._busy||!this._hasService("show_message")}
          >
            Send message</button
          ><button
            type="button"
            ?disabled=${!!this._busy||!this._hasService("stop_message")}
            @click=${()=>this._run("Restoring display\u2026",()=>this._call("stop_message"),"Previous display restored.")}
          >
            Stop message
          </button>
        </div>
      </form>`}render(){return this.config?c`<ha-card
      ><div class="header">
        <div>
          <h2>${this.config.title||"iDotMatrix"}</h2>
          <span class="muted">Display designer & controls</span>
        </div>
        <label class="size"
          >Panel size<select
            .value=${String(this._size)}
            @change=${e=>this._size=Number(e.target.value)}
          >
            ${[16,32,64].map(e=>c`<option value=${String(e)} ?selected=${e===this._size}>${e} × ${e}</option>`)}
          </select></label
        >
      </div>
      <nav role="tablist" aria-label="Card sections">
        ${f.map((e,t)=>c`<button id=${`tab-${e}`} role="tab" aria-selected=${this._view===e} aria-controls="card-panel" tabindex=${this._view===e?"0":"-1"} @click=${()=>this._changeView(e)} @keydown=${s=>this._tabKey(s,t)}>${{designer:"Designer",displays:"Displays",gifs:"GIFs",messages:"Messages"}[e]}</button>`)}
      </nav>
      ${this.hass?.connection?l:c`<p class="status error" role="status">Waiting for Home Assistant…</p>`}
      <div
        id="card-panel"
        role="tabpanel"
        aria-labelledby=${`tab-${this._view}`}
      >
        ${this._view==="designer"?this._designer():this._view==="displays"?this._displays():this._view==="gifs"?this._gifs():this._messages()}
      </div>
      ${this._status?c`<p class=${`status ${this._error?"error":""}`} role=${this._error?"alert":"status"} aria-live="polite">${this._status}</p>`:l}
      <details class="connection">
        <summary>Panel connection</summary>
        <p class="hint">
          Disconnect to use the phone app. Reconnect to resume Home Assistant
          control. Affects all connected panels.
        </p>
        <div class="actions">
          <button
            ?disabled=${!!this._busy||!this._hasService("disconnect")}
            @click=${()=>this._run("Disconnecting\u2026",()=>this._call("disconnect"),"Panel disconnected. You can use the phone app.")}
          >
            Disconnect</button
          ><button
            ?disabled=${!!this._busy||!this._hasService("reconnect")}
            @click=${()=>this._run("Reconnecting\u2026",()=>this._call("reconnect"),"Panel reconnected.")}
          >
            Reconnect
          </button>
        </div>
      </details>
      ${(this._view==="designer"?["all"]:this._view==="displays"?[...new Set(_[this._mode].fields.map(e=>e[2]))]:[]).map(e=>c`<datalist id=${`entities-${e}`}>
            ${Object.values(this.hass?.states||{}).filter(t=>e==="all"||t.entity_id.startsWith(e+".")).map(t=>c`<option value=${t.entity_id}>
                    ${t.attributes?.friendly_name||t.entity_id}
                  </option>`)}
          </datalist>`)}</ha-card
    >`:l}getCardSize(){return this._view==="designer"?Math.max(8,6+this._layers.length*3):7}};customElements.get("idotmatrix-card")||customElements.define("idotmatrix-card",se);window.customCards=window.customCards||[];window.customCards.some(r=>r.type==="idotmatrix-card")||window.customCards.push({type:"idotmatrix-card",name:"iDotMatrix Card",description:"Designer, dashboards, GIFs and messages for iDotMatrix",preview:!0,documentationURL:"https://github.com/tukies/iDotMatrix-HomeAssistant"});console.info(`iDotMatrix Card v${we} `);export{se as IDotMatrixCard};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
