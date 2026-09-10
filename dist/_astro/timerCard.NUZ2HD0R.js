var e={small:260,medium:330,large:430};function t(t){let n=(e,t,n)=>Math.min(n,Math.max(t,e)),r=t.width,i=typeof r==`number`?Math.round(n(r,220,560)):e[t.size]??320,a=t.height;return{id:String(t.id??`${Date.now()}-${Math.random().toString(36).slice(2,8)}`),name:String(t.name??`Sin nombre`),startDate:String(t.startDate??new Date().toISOString()),endDate:String(t.endDate??new Date().toISOString()),color:typeof t.color==`string`&&t.color?t.color:`#7bb5e3`,width:i,height:typeof a==`number`&&a>=170?Math.round(n(a,170,560)):null,locked:!!t.locked,createdAt:typeof t.createdAt==`number`?t.createdAt:Date.now()}}function n(e){return`mi-timer:${e}`}function r(){return typeof crypto<`u`&&`randomUUID`in crypto?crypto.randomUUID():`timer-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function i(e){return{id:r(),...e,createdAt:Date.now()}}function a(e){if(typeof window>`u`)return[];try{let r=window.localStorage.getItem(n(e));if(!r)return[];let i=JSON.parse(r);return Array.isArray(i.timers)?i.timers.map(e=>t(e)):[]}catch{return[]}}function o(e,t){typeof window>`u`||window.localStorage.setItem(n(e),JSON.stringify({userId:e,timers:t}))}function s(e,t){let n=i(t),r=a(e);return r.push(n),o(e,r),n}function c(e,t){let n=a(e),r=n.findIndex(e=>e.id===t.id);return r===-1?!1:(n[r]={...n[r],...t},o(e,n),!0)}function l(e,t,n){let r=a(e),i=r.findIndex(e=>e.id===t);return i===-1?!1:(r[i]={...r[i],...n},o(e,r),!0)}function u(e,t){let n=a(e),r=n.filter(e=>e.id!==t);return r.length===n.length?!1:(o(e,r),!0)}var d={dia:86400,hora:3600,minuto:60,segundo:1};function f(e,t=Date.now()){let n=new Date(e).getTime()-t;return n<=0?{dias:0,horas:0,minutos:0,segundos:0,terminado:!0,totalMs:0,restanteMs:0}:{dias:Math.floor(n/(d.dia*1e3)),horas:Math.floor(n/(d.hora*1e3)%24),minutos:Math.floor(n/(d.minuto*1e3)%60),segundos:Math.floor(n/1e3%60),terminado:!1,totalMs:n,restanteMs:n}}function p(e,t,n=Date.now()){let r=new Date(e).getTime(),i=new Date(t).getTime(),a=i-r;if(a<=0)return{porcentaje:0,totalMs:0,restanteMs:0};let o=Math.max(0,i-n),s=Math.min(100,Math.max(0,o/a*100));return{porcentaje:Math.floor(s),totalMs:a,restanteMs:o}}function m(e){return e.toString().padStart(2,`0`)}function h(e){let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString(`es-AR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}function g(e){let t=new Date(e);if(Number.isNaN(t.getTime()))return``;let n=e=>e.toString().padStart(2,`0`);return`${t.getFullYear()}-${n(t.getMonth()+1)}-${n(t.getDate())}T${n(t.getHours())}:${n(t.getMinutes())}`}function _(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function v(e,t,n){return Math.min(n,Math.max(t,e))}function y(e){return Math.round(e)}function b(e){let t=f(e.endDate),n=p(e.startDate,e.endDate),r=e=>m(e),i=`--accent: ${_(e.color)}; border-color: ${_(e.color)}; width: ${e.width}px;${e.height==null?``:` height: ${e.height}px;`}`;return`
  <article
    class="timer-card"
    data-timer-id="${_(e.id)}"
    data-start="${_(e.startDate)}"
    data-end="${_(e.endDate)}"
    data-locked="${e.locked?`true`:`false`}"
    style="${i}"
  >
    <header class="timer-head">
      <span class="timer-dot" style="background-color: ${_(e.color)}; box-shadow: 0 0 10px ${_(e.color)}"></span>
      <h2 class="timer-name">${_(e.name)}</h2>
      <button
        type="button"
        class="lock-btn"
        data-lock-btn
        title="${e.locked?`Tamaño bloqueado. Clic para permitir redimensionar.`:`Clic para bloquear el tamaño`}"
        aria-label="Bloquear o desbloquear el tamaño"
      >${e.locked?`🔒`:`🔓`}</button>
    </header>

    <div class="timer-countdown">
      <div class="nums">
        <span class="value" data-unit="days">${r(t.dias)}</span>
        <span class="sep">:</span>
        <span class="value" data-unit="hours">${r(t.horas)}</span>
        <span class="sep">:</span>
        <span class="value" data-unit="minutes">${r(t.minutos)}</span>
        <span class="sep">:</span>
        <span class="value" data-unit="seconds">${r(t.segundos)}</span>
      </div>
      <div class="labs">
        <span class="label">DÍAS</span>
        <span class="label">HRS</span>
        <span class="label">MIN</span>
        <span class="label">SEG</span>
      </div>
    </div>

    <div class="timer-bar">
      <div class="timer-bar-fill" data-bar style="width: ${n.porcentaje}%"></div>
    </div>
    <div class="timer-percent" data-percent>${n.porcentaje}%</div>

    <footer class="timer-foot">
      <span class="timer-when">Hasta: ${_(h(e.endDate))}</span>
      <a class="timer-config" href="/mi-timer/config?id=${_(e.id)}">Configurar</a>
    </footer>

    <span class="resize-handle" data-resize-handle title="Arrastrá la esquina para redimensionar"></span>
  </article>
  `}function x(e){let t=e.dataset.end??``,n=e.dataset.start??``,r=f(t),i=p(n,t),a=(t,n)=>{let r=e.querySelector(`[data-unit="${t}"]`);r&&(r.textContent=n)};r.terminado?(a(`days`,`00`),a(`hours`,`00`),a(`minutes`,`00`),a(`seconds`,`00`)):(a(`days`,m(r.dias)),a(`hours`,m(r.horas)),a(`minutes`,m(r.minutos)),a(`seconds`,m(r.segundos)));let o=e.querySelector(`[data-bar]`);o&&(o.style.width=`${i.porcentaje}%`);let s=e.querySelector(`[data-percent]`);s&&(s.textContent=`${i.porcentaje}%`)}var S=new WeakSet,C=new WeakMap;function w(e,t){C.set(e,t)}function T(e){return C.get(e)??{}}function E(e){e.addEventListener(`click`,t=>{let n=t.target.closest(`[data-lock-btn]`);if(!n)return;let r=n.closest(`[data-timer-id]`);if(!r)return;let i=r.dataset.timerId??``,a=r.dataset.locked!==`true`;r.dataset.locked=String(a),n.textContent=a?`🔒`:`🔓`,n.title=a?`Tamaño bloqueado. Clic para permitir redimensionar.`:`Clic para bloquear el tamaño`,T(e).onLock?.(i,a)})}function D(e){e.addEventListener(`pointerdown`,t=>{let n=t,r=n.target.closest(`[data-resize-handle]`);if(!r)return;let i=r.closest(`[data-timer-id]`);if(!i||i.dataset.locked===`true`)return;n.preventDefault(),r.setPointerCapture?.(n.pointerId);let a=i.dataset.timerId??``,o=i.getBoundingClientRect(),s=n.clientX,c=n.clientY,l=o.width,u=o.height,d=e=>{let t=e.clientX-s,n=e.clientY-c,r=y(v(l+t,220,560)),a=y(v(u+n,170,560));i.style.width=`${r}px`,i.style.height=`${a}px`,i.classList.add(`dragging`)},f=t=>{r.removeEventListener(`pointermove`,d),r.removeEventListener(`pointerup`,f),r.removeEventListener(`pointercancel`,f),r.releasePointerCapture?.(t.pointerId),i.classList.remove(`dragging`);let n=y(parseFloat(i.style.width)||l),o=y(parseFloat(i.style.height)||u);T(e).onResize?.(a,n,o)};r.addEventListener(`pointermove`,d),r.addEventListener(`pointerup`,f),r.addEventListener(`pointercancel`,f)})}function O(e=document,t,n){if(t&&C.set(e,t),S.has(e))return;S.add(e),n?.bindInteractions!==!1&&(E(e),D(e));let r=()=>{e.querySelectorAll(`[data-timer-id]`).forEach(x)};r(),window.setInterval(r,1e3)}export{l as a,u as c,g as i,a as l,O as n,c as o,b as r,s,w as t,t as u};