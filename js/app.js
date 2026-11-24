(() => {
  const partInfo = {
    stator: {number:'ДЕТАЛЬ 01',title:'Статор',copy:'Нерухоме осердя з обмотками. Коли через них проходить трифазний струм, усередині виникає обертове магнітне поле.',note:'ЗАКРІПЛЕНИЙ У КОРПУСІ'},
    rotor: {number:'ДЕТАЛЬ 02',title:'Ротор',copy:'Рухома частина двигуна. Поле статора індукує струм у провідниках ротора, а взаємодія магнітних полів створює обертальний момент.',note:'ОБЕРТАЄТЬСЯ ВСЕРЕДИНІ СТАТОРА'},
    shaft: {number:'ДЕТАЛЬ 03',title:'Вал і підшипники',copy:'Вал передає обертання назовні — наприклад, до вентилятора або насоса. Підшипники підтримують його й зменшують тертя.',note:'ПЕРЕДАЄ МЕХАНІЧНУ РОБОТУ'},
    cage: {number:'ДЕТАЛЬ 04',title:'Клітка ротора',copy:'Провідні стрижні з’єднані кільцями на кінцях, наче клітка. Струм у стрижнях індукується магнітним полем статора.',note:'ТИПОВА КОНСТРУКЦІЯ АСИНХРОННОЇ МАШИНИ'}
  };
  document.querySelectorAll('.hero-image-wrap img,.cutaway-photo img').forEach(img => img.addEventListener('error', () => img.parentElement.classList.add('image-offline'), {once:true}));
  document.querySelectorAll('[data-part]').forEach(button => button.addEventListener('click', () => {
    const part = partInfo[button.dataset.part]; if (!part) return;
    document.querySelectorAll('.part-tab').forEach(tab => {const selected=tab.dataset.part===button.dataset.part;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected))});
    document.querySelectorAll('.photo-point').forEach(point=>point.classList.toggle('selected',point.dataset.part===button.dataset.part));
    document.getElementById('part-number').textContent=part.number;
    document.getElementById('part-title').textContent=part.title;
    document.getElementById('part-copy').textContent=part.copy;
    document.getElementById('part-note').textContent=part.note;
  }));

  const modeCopy={
    motor:{input:'ЕЛЕКТРИЧНА<br>ЕНЕРГІЯ',output:'МЕХАНІЧНА<br>ЕНЕРГІЯ',inputIcon:'ϟ',outputIcon:'↻',inFlow:'СТРУМ В ОБМОТКАХ',outFlow:'ОБЕРТАННЯ ВАЛА',note:'Струм у статорі створює магнітне поле, а його взаємодія з ротором обертає вал.'},
    generator:{input:'МЕХАНІЧНА<br>ЕНЕРГІЯ',output:'ЕЛЕКТРИЧНА<br>ЕНЕРГІЯ',inputIcon:'↻',outputIcon:'ϟ',inFlow:'ОБЕРТАННЯ ВАЛА',outFlow:'ІНДУКОВАНИЙ СТРУМ',note:'Механічна робота обертає ротор. Зміна магнітного потоку наводить ЕРС в обмотках.'}
  };
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    const data=modeCopy[button.dataset.mode],diagram=document.querySelector('.energy-diagram');
    document.querySelectorAll('.mode-button').forEach(item=>{const selected=item===button;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected))});
    diagram.dataset.mode=button.dataset.mode;
    document.getElementById('input-energy').innerHTML=data.input;document.getElementById('output-energy').innerHTML=data.output;
    document.getElementById('input-icon').textContent=data.inputIcon;document.getElementById('output-icon').textContent=data.outputIcon;
    document.getElementById('input-flow-label').textContent=data.inFlow;document.getElementById('output-flow-label').textContent=data.outFlow;
    document.getElementById('energy-note').textContent=data.note;
  }));

  const bar=document.getElementById('read-progress');
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=`${max>0?scrollY/max*100:0}%`};
  addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
  const anchors=[...document.querySelectorAll('.main-nav a')];
  if('IntersectionObserver'in window){const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)anchors.forEach(a=>a.classList.toggle('current',a.hash===`#${entry.target.id}`))}),{rootMargin:'-38% 0px -52% 0px'});document.querySelectorAll('main section[id]').forEach(s=>navObserver.observe(s))}

  buildExplodedModel();

  function buildExplodedModel(){
    const canvas=document.getElementById('motor-canvas'),fallback=document.getElementById('webgl-fallback');
    if(!window.THREE||!window.gsap||!window.ScrollTrigger){fallback.classList.add('show');return}
    const THREE=window.THREE,gsap=window.gsap;gsap.registerPlugin(window.ScrollTrigger);
    let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){fallback.classList.add('show');return}
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x101512,10,24);
    const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(5.4,3.8,8.7);camera.lookAt(0,0,0);
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene.add(new THREE.HemisphereLight(0xdcebd2,0x20251f,2.4));
    const key=new THREE.DirectionalLight(0xffefd4,3.2);key.position.set(4,7,6);scene.add(key);
    const rim=new THREE.PointLight(0xc5ef78,26,18);rim.position.set(-5,2,3);scene.add(rim);
    const warm=new THREE.PointLight(0xef784f,20,14);warm.position.set(1,-3,-4);scene.add(warm);
    const root=new THREE.Group();scene.add(root);
    const steel=new THREE.MeshStandardMaterial({color:0x737f77,metalness:.8,roughness:.3});
    const darkSteel=new THREE.MeshStandardMaterial({color:0x313c35,metalness:.78,roughness:.34});
    const copper=new THREE.MeshStandardMaterial({color:0xc66a40,metalness:.68,roughness:.3,emissive:0x301309,emissiveIntensity:.18});
    const greenMetal=new THREE.MeshStandardMaterial({color:0x708b55,metalness:.65,roughness:.34});
    const rubber=new THREE.MeshStandardMaterial({color:0x202822,metalness:.25,roughness:.48});
    const parts=[];
    const addPart=(name,group,explode, label,anchor)=>{root.add(group);parts.push({name,group,base:group.position.clone(),explode:new THREE.Vector3(...explode),label,anchor:new THREE.Vector3(...anchor)})};
    const axisX=(mesh)=>{mesh.rotation.z=Math.PI/2;return mesh};
    const ringX=(mesh)=>{mesh.rotation.y=Math.PI/2;return mesh};
    const housing=new THREE.Group();
    const shell=axisX(new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.12,2.55,64,1,false,.62,Math.PI*1.5),new THREE.MeshStandardMaterial({color:0x39463d,metalness:.7,roughness:.32,side:THREE.DoubleSide})));housing.add(shell);
    for(let x=-1.1;x<=1.11;x+=.18){const fin=ringX(new THREE.Mesh(new THREE.TorusGeometry(1.13,.033,8,64),steel));fin.position.x=x;housing.add(fin)}
    for(const x of [-1.3,1.3]){const rimRing=ringX(new THREE.Mesh(new THREE.TorusGeometry(.98,.09,14,64),darkSteel));rimRing.position.x=x;housing.add(rimRing)}
    const terminal=new THREE.Mesh(new THREE.BoxGeometry(.75,.5,.75),darkSteel);terminal.position.set(-.45,1.15,0);housing.add(terminal);
    const terminalCap=new THREE.Mesh(new THREE.BoxGeometry(.72,.09,.72),steel);terminalCap.position.set(-.45,1.43,0);housing.add(terminalCap);
    for(let i=0;i<3;i++){const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.08,12),copper);bolt.position.set(-.66+i*.2,1.49,-.2);housing.add(bolt)}
    addPart('корпус',housing,[0,.9,-.35],'КОРПУС',[0,1.4,0]);

    const stator=new THREE.Group();
    const statorCore=axisX(new THREE.Mesh(new THREE.CylinderGeometry(.92,.92,2.18,48,1,true),greenMetal));stator.add(statorCore);
    for(let x=-1.04;x<=1.05;x+=.12){const band=ringX(new THREE.Mesh(new THREE.TorusGeometry(.92,.018,6,48),steel));band.position.x=x;stator.add(band)}
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const winding=new THREE.Mesh(new THREE.TorusGeometry(.21,.055,10,24),copper);winding.position.set(Math.sin(a)*.79,Math.cos(a)*.79,0);winding.rotation.y=a;stator.add(winding)}
    addPart('статор',stator,[-1.65,0,0],'СТАТОР · НЕРУХОМІ ОБМОТКИ',[-1.1,1.05,0]);

    const rotor=new THREE.Group();
    const core=axisX(new THREE.Mesh(new THREE.CylinderGeometry(.66,.66,1.95,48),darkSteel));rotor.add(core);
    for(let i=0;i<24;i++){const a=i*Math.PI/12;const bar=new THREE.Mesh(new THREE.BoxGeometry(1.82,.045,.045),copper);bar.position.set(0,Math.sin(a)*.64,Math.cos(a)*.64);rotor.add(bar)}
    for(const x of [-.92,.92]){const ring=ringX(new THREE.Mesh(new THREE.TorusGeometry(.64,.05,10,48),copper));ring.position.x=x;rotor.add(ring)}
    addPart('ротор',rotor,[1.45,-.25,0],'РОТОР · ОБЕРТОВА ЧАСТИНА',[1.05,.55,0]);

    const shaftGroup=new THREE.Group();const shaft=axisX(new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,4.25,32),steel));shaftGroup.add(shaft);
    for(const x of [-1.75,1.75]){const shoulder=axisX(new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.27,32),darkSteel));shoulder.position.x=x;shaftGroup.add(shoulder)}
    addPart('вал',shaftGroup,[2.6,.35,.15],'ВАЛ · ПЕРЕДАЄ ОБЕРТАННЯ',[2.35,.05,0]);

    const bearingLeft=new THREE.Group(),bearingRight=new THREE.Group();
    for(const [group,x] of [[bearingLeft,-1.37],[bearingRight,1.37]]){const plate=ringX(new THREE.Mesh(new THREE.TorusGeometry(.52,.1,16,48),steel));plate.position.x=x;group.add(plate);const inner=ringX(new THREE.Mesh(new THREE.TorusGeometry(.3,.055,12,40),copper));inner.position.x=x;group.add(inner)}
    addPart('підшипники',bearingLeft,[-2.6,-.7,0],'ПІДШИПНИКИ · ПІДТРИМУЮТЬ ВАЛ',[-2.0,-.5,0]);
    addPart('підшипники',bearingRight,[2.6,-.7,0],'ПІДШИПНИКИ · ПІДТРИМУЮТЬ ВАЛ',[2.0,-.5,0]);

    const fanGroup=new THREE.Group();const hub=axisX(new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.32,32),steel));hub.position.x=1.63;fanGroup.add(hub);
    const fanRing=ringX(new THREE.Mesh(new THREE.TorusGeometry(.49,.035,8,48),darkSteel));fanRing.position.x=1.78;fanGroup.add(fanRing);
    for(let i=0;i<8;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.08,.48,.16),greenMetal);const a=i*Math.PI/4;blade.position.set(1.78,Math.cos(a)*.28,Math.sin(a)*.28);blade.rotation.x=a;fanGroup.add(blade)}
    addPart('вентилятор',fanGroup,[2.65,1.05,0],'ВЕНТИЛЯТОР · ОХОЛОДЖУЄ МАШИНУ',[2.3,1.0,0]);

    const base=new THREE.Mesh(new THREE.BoxGeometry(2.8,.12,1.75),rubber);base.position.set(0,-1.23,0);root.add(base);
    const feet=[];for(const x of [-.9,.9]){const foot=new THREE.Mesh(new THREE.BoxGeometry(.58,.27,1.12),darkSteel);foot.position.set(x,-1.04,0);root.add(foot);feet.push(foot)}
    const ground=new THREE.GridHelper(12,26,0x45554a,0x26332b);ground.position.y=-1.32;root.add(ground);
    root.rotation.set(.12,-.26,.1);

    const stepData=[
      {at:0,count:'01 — ЗІБРАНИЙ ДВИГУН',title:'Усе починається<br>з <em>корпусу.</em>',text:'Зовні — ребра охолодження й контактна коробка. Усередині заховані нерухомий статор і ротор.',label:'КОРПУС',anchor:[0,1.4,0]},
      {at:.18,count:'02 — КОРПУС',title:'Знімаємо<br>зовнішній <em>шар.</em>',text:'Корпус захищає механізм і відводить тепло. Після його зняття відкривається статор.',label:'КОРПУС',anchor:[0,1.4,0]},
      {at:.37,count:'03 — СТАТОР',title:'Нерухомі<br><em>обмотки.</em>',text:'Статор утримує обмотки. Змінний струм у них створює магнітне поле, що обертається.',label:'СТАТОР',anchor:[-1.1,1.05,0]},
      {at:.55,count:'04 — РОТОР',title:'У центрі —<br><em>ротор.</em>',text:'Поле наводить струм у клітці ротора. Взаємодія струмів і поля змушує ротор обертатися.',label:'РОТОР І КЛІТКА',anchor:[1.05,.55,0]},
      {at:.73,count:'05 — ВАЛ І ОПОРА',title:'Обертання<br>виходить <em>назовні.</em>',text:'Вал передає механічну роботу. Підшипники утримують його на осі, а вентилятор охолоджує двигун.',label:'ВАЛ · ПІДШИПНИКИ',anchor:[2.35,.05,0]},
      {at:.9,count:'06 — УСІ ЧАСТИНИ РАЗОМ',title:'Тепер видно<br>всю <em>машину.</em>',text:'Частини знову складаються в один двигун. Далі подивімося, як струм створює в ньому рух.',label:'ЕЛЕКТРИЧНА МАШИНА',anchor:[0,0,0]}
    ];
    let scrollP=0,activeStep=-1,elapsed=0;const smoothParts=parts.map(p=>p.base.clone());const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label=document.getElementById('model-label'),progressBar=document.getElementById('exploded-progress'),counter=document.getElementById('exploded-count'),title=document.getElementById('exploded-title'),copy=document.getElementById('exploded-text');
    function resize(){const box=canvas.parentElement.getBoundingClientRect();const width=box.width,height=box.height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();const mobile=matchMedia('(max-width: 680px)').matches;camera.position.set(mobile?5.5:5.4,mobile?4.6:3.8,mobile?10.8:8.7);camera.lookAt(mobile?0:.25,0,0)}
    new ResizeObserver(resize).observe(canvas.parentElement);resize();
    label.style.right='auto';label.style.bottom='auto';
    function setProgress(value){scrollP=value;progressBar.style.width=`${Math.round(value*100)}%`;let ix=0;for(let i=0;i<stepData.length;i++)if(value>=stepData[i].at)ix=i;if(ix!==activeStep){activeStep=ix;const item=stepData[ix];counter.textContent=item.count;title.innerHTML=item.title;copy.textContent=item.text;label.querySelector('span').textContent=item.label;label.dataset.anchor=item.anchor.join(',')}}
    if(reduced){setProgress(.88)}else{window.ScrollTrigger.create({trigger:'.exploded-scroll',start:'top top',end:'bottom bottom',scrub:.55,onUpdate:self=>setProgress(self.progress)});setProgress(0)}
    function render(){requestAnimationFrame(render);elapsed+=.008;const spread=gsap.utils.clamp(0,1,(scrollP-.08)/.78);for(let i=0;i<parts.length;i++){const p=parts[i],target=p.base.clone().addScaledVector(p.explode,spread);smoothParts[i].lerp(target,.11);p.group.position.copy(smoothParts[i])}if(!reduced){root.rotation.y=-.26+Math.sin(elapsed*.34)*.1;root.rotation.x=.12+Math.sin(elapsed*.25)*.025;rotor.rotation.x=elapsed*.5;rotor.rotation.y=0;fanGroup.rotation.x=elapsed*.5}const a=label.dataset.anchor?.split(',').map(Number)||[0,1.4,0];const v=new THREE.Vector3(...a);root.localToWorld(v);v.project(camera);const rect=canvas.getBoundingClientRect();const px=(v.x*.5+.5)*rect.width,py=(-v.y*.5+.5)*rect.height;label.style.left=`${Math.max(8,Math.min(rect.width-190,px+16))}px`;label.style.top=`${Math.max(100,Math.min(rect.height-50,py-8))}px`;renderer.render(scene,camera)}
    render();
  }
})();
