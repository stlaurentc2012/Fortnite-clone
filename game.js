// -------------------
// Fortnite-style clone
// -------------------

// THREE.js scene setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Ground
let ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshPhongMaterial({color:0x228B22})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Player setup
let player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshPhongMaterial({color:0x00ffcc})
);
player.position.set(0,1,0);
scene.add(player);

camera.position.set(0,2,5);

// Pointer lock controls
let controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener('click', ()=>controls.lock());
scene.add(controls.getObject());

// Movement
let move = {forward:false, backward:false, left:false, right:false};
let velocity = new THREE.Vector3();
document.addEventListener('keydown', e => {
  if(e.key==='w') move.forward=true;
  if(e.key==='s') move.backward=true;
  if(e.key==='a') move.left=true;
  if(e.key==='d') move.right=true;
});
document.addEventListener('keyup', e => {
  if(e.key==='w') move.forward=false;
  if(e.key==='s') move.backward=false;
  if(e.key==='a') move.left=false;
  if(e.key==='d') move.right=false;
});

// -------------------
// Tilted Towers blocks
// -------------------
let blocks = [];
function addBlock(x,y,z){
  let b = new THREE.Mesh(
    new THREE.BoxGeometry(6,10,6),
    new THREE.MeshPhongMaterial({color:0x888888})
  );
  b.position.set(x,y,z);
  scene.add(b);
  blocks.push(b);
}
for(let i=-20;i<=20;i+=10){
  addBlock(i,5,0);
  addBlock(i,5,-10);
  addBlock(i,5,10);
}

// -------------------
// Enemies / Bots
// -------------------
let enemies = [];
function spawnEnemy(x,z){
  let enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1,2,1),
    new THREE.MeshPhongMaterial({color:0xff0000})
  );
  enemy.position.set(x,1,z);
  scene.add(enemy);
  enemies.push({mesh:enemy, health:100});
}
for(let i=0;i<5;i++){
  spawnEnemy(Math.random()*50-25, Math.random()*50-25);
}

// Simple bot AI: move towards player, shoot occasionally
function updateEnemies(){
  enemies.forEach(bot=>{
    if(bot.health<=0) return;
    // Move towards player
    let dir = new THREE.Vector3();
    dir.subVectors(player.position, bot.mesh.position);
    if(dir.length()>1){
      dir.normalize();
      bot.mesh.position.add(dir.multiplyScalar(0.05));
    }
    // Bot shooting (simple)
    if(Math.random()<0.01){
      botShoot(bot);
    }
  });
}

// Bot shooting function
function botShoot(bot){
  let ray = new THREE.Raycaster(bot.mesh.position.clone().add(new THREE.Vector3(0,1,0)), player.position.clone().sub(bot.mesh.position).normalize());
  let hits = ray.intersectObject(player);
  if(hits.length>0){
    playerHealth -= 5;
    if(playerHealth<0) playerHealth=0;
    document.getElementById('health').innerText=`Health: ${playerHealth}`;
  }
}

// -------------------
// Player weapons
// -------------------
let weapons = [
  {name:'Rifle', damage:25, ammo:30, maxAmmo:30},
  {name:'Shotgun', damage:50, ammo:8, maxAmmo:8}
];
let currentWeapon = 0;
let playerHealth = 100;

// HUD update
function updateHUD(){
  document.getElementById('ammo').innerText=`Ammo: ${weapons[currentWeapon].ammo}/${weapons[currentWeapon].maxAmmo}`;
  document.getElementById('weapon').innerText=`Weapon: ${weapons[currentWeapon].name}`;
  document.getElementById('health').innerText=`Health: ${playerHealth}`;
}
updateHUD();

// Shooting
document.addEventListener('mousedown', e=>{
  if(e.button===0 && weapons[currentWeapon].ammo>0){
    weapons[currentWeapon].ammo--;
    updateHUD();
    // Raycast to enemies
    let ray = new THREE.Raycaster(camera.position, camera.getWorldDirection(new THREE.Vector3()));
    let hits = ray.intersectObjects(enemies.map(en=>en.mesh));
    if(hits.length>0){
      let enemy = enemies.find(en=>en.mesh===hits[0].object);
      if(enemy){
        enemy.health -= weapons[currentWeapon].damage;
        if(enemy.health<=0){
          scene.remove(enemy.mesh);
          enemies = enemies.filter(e=>e!==enemy);
          // Respawn after 3s
          setTimeout(()=>spawnEnemy(Math.random()*50-25, Math.random()*50-25),3000);
        }
      }
    }
  }
});

// Reload
document.addEventListener('keydown', e=>{
  if(e.key==='r'){
    weapons[currentWeapon].ammo = weapons[currentWeapon].maxAmmo;
    updateHUD();
  }
});

// -------------------
// Basic building (walls)
// -------------------
let builds = [];
document.addEventListener('keydown', e=>{
  if(e.key==='z'){ placeBuild(0,0,5); } // wall
  if(e.key==='x'){ placeBuild(5,0,0); } // floor
  if(e.key==='c'){ placeBuild(0,0,-5); } // ramp
});

function placeBuild(xOffset,yOffset,zOffset){
  let b = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshPhongMaterial({color:0xffff00})
  );
  b.position.set(player.position.x + xOffset, player.position.y + yOffset, player.position.z + zOffset);
  scene.add(b);
  builds.push(b);
}

// -------------------
// Animation loop
// -------------------
function animate(){
  requestAnimationFrame(animate);

  // Player movement
  let speed = 0.1;
  if(move.forward) controls.moveForward(speed);
  if(move.backward) controls.moveForward(-speed);
  if(move.left) controls.moveRight(-speed);
  if(move.right) controls.moveRight(speed);

  updateEnemies();
  renderer.render(scene,camera);
}
animate();

// Resize
window.addEventListener('resize',()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
