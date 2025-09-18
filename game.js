// Basic Fortnite-style clone
// Player setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10,20,10);
scene.add(light);

// Ground
let ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500,500),
  new THREE.MeshPhongMaterial({color:0x228B22})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Player
let player = new THREE.Mesh(
  new THREE.BoxGeometry(1,2,1),
  new THREE.MeshPhongMaterial({color:0x00ffcc})
);
scene.add(player);
camera.position.set(0,2,5);

// Controls
let controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener('click', ()=>controls.lock());
scene.add(controls.getObject());

// Enemies
let enemies = [];
function spawnEnemy(x,z){
  let enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1,2,1),
    new THREE.MeshPhongMaterial({color:0xff0000})
  );
  enemy.position.set(x,1,z);
  scene.add(enemy);
  enemies.push({mesh:enemy,health:100});
}
spawnEnemy(10,10);
spawnEnemy(-10,5);

// Simple Tilted Towers blocks
for(let i=0;i<5;i++){
  let b = new THREE.Mesh(
    new THREE.BoxGeometry(6,10,6),
    new THREE.MeshPhongMaterial({color:0x888888})
  );
  b.position.set(i*10,5,0);
  scene.add(b);
}

// Shooting
let ammo = 30, maxAmmo=30;
document.addEventListener('mousedown',(e)=>{
  if(e.button===0 && ammo>0){
    ammo--;
    document.getElementById('ammo').innerText = `Ammo: ${ammo}/${maxAmmo}`;
    let ray = new THREE.Raycaster(camera.position, camera.getWorldDirection(new THREE.Vector3()));
    let hits = ray.intersectObjects(enemies.map(e=>e.mesh));
    if(hits.length>0){
      let enemy = enemies.find(en=>en.mesh===hits[0].object);
      if(enemy){ enemy.health-=25; if(enemy.health<=0){ scene.remove(enemy.mesh); enemies=enemies.filter(e=>e!==enemy);} }
    }
  }
});
document.addEventListener('keydown',(e)=>{
  if(e.key==='r'){ ammo=maxAmmo; document.getElementById('ammo').innerText=`Ammo: ${ammo}/${maxAmmo}`; }
});

// Animation loop
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();
