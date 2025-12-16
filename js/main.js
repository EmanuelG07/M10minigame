window.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const TILE = 32;
  const VIEW_W = canvas.width;
  const VIEW_H = canvas.height;

  const tileset = ['#8fbc6b','#2f5b2f','#4aa3d8'];

  const mapW = 16, mapH = 12;
  const map = [
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,1,1,1,0,0,2,2,2,0,
    0,0,0,0,0,0,0,1,0,1,0,0,2,0,2,0,
    0,0,0,0,0,0,0,1,0,1,0,0,2,2,2,0,
    0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,
    0,0,0,0,0,2,0,2,0,0,0,1,1,1,0,0,
    0,0,0,0,0,2,2,2,0,0,0,1,0,1,0,0,
    0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ];

  function tileAt(tx,ty){ return (tx<0||ty<0||tx>=mapW||ty>=mapH)?1:map[ty*mapW+tx]; }

  const player = {x:5*TILE+TILE/2, y:5*TILE+TILE/2, w:20, h:28, speed:120, vx:0, vy:0};
  let lastTime = 0, keys = {};

  window.addEventListener('keydown', e=>keys[e.key]=true);
  window.addEventListener('keyup', e=>keys[e.key]=false);

  function canWalkTo(px,py){
    const corners=[
      {x:px-player.w/2,y:py-player.h/2},
      {x:px+player.w/2-1,y:py-player.h/2},
      {x:px-player.w/2,y:py+player.h/2-1},
      {x:px+player.w/2-1,y:py+player.h/2-1}
    ];
    for(const c of corners){
      const t = tileAt(Math.floor(c.x/TILE),Math.floor(c.y/TILE));
      if(t===1||t===2) return false;
    }
    return true;
  }

 
  let encounterCooldown = 0;
  let inBattle = false;
  let currentWild = null;

  const wildList = [
    {name:"Rayquaza", min:100,max:1000,img:"img/rayquaza.png"},
    {name:"Arceus", min:500,max:1000,img:"img/arceus.png"},
    {name:"Bidoof", min:100000,max:1000000000,img:"img/bidoof.png"},
    {name:"Mewtwo", min:100,max:1002,img:"img/mewtwo.png"},
    {name:"Mew", min:100,max:1000,img:"img/mew.png"},
    {name:"Solgaleo", min:100,max:1000,img:"img/solgaleo.png"},
    {name:"Kyogre", min:100,max:1000,img:"img/kyogre.png"},
    {name:"Lugia", min:100,max:1000,img:"img/lugia.png"},
    {name:"Lunala", min:100,max:1000,img:"img/lunala.png"},
    {name:"Groudon", min:100,max:1000,img:"img/groudon.png"},
    {name:"Xerneas", min:100,max:1000,img:"img/xerneas.png"}
  ];

  function checkEncounter(px,py){
    if(encounterCooldown>0) return;
    const tile = tileAt(Math.floor(px/TILE), Math.floor(py/TILE));
    if(tile===0 && Math.random()<0.005){
      startBattle();
      encounterCooldown = 2;
    }
  }

  function startBattle(){
    if(inBattle) return;
    const chosen = wildList[Math.floor(Math.random()*wildList.length)];
    const lvl = Math.floor(Math.random()*(chosen.max-chosen.min+1))+chosen.min;
    currentWild = {name:chosen.name,lvl:lvl,img:chosen.img};
    inBattle = true;

    document.getElementById("battle-text").innerText=`A wild ${currentWild.name} (Lv ${currentWild.lvl}) appeared!`;
    const imgEl = document.getElementById("battle-img");
    imgEl.src=currentWild.img;
    imgEl.alt=currentWild.name;

    const overlay = document.getElementById("battle-overlay");
    overlay.classList.remove("hidden");
    setTimeout(()=>overlay.classList.add("show"),20);

    const menu = document.getElementById("battle-menu");
    menu.classList.add("hidden");
    setTimeout(()=>menu.classList.remove("hidden"),600);
  }

  function endBattle(){
    const overlay = document.getElementById("battle-overlay");
    overlay.classList.remove("show");
    const menu = document.getElementById("battle-menu");
    menu.classList.add("hidden");
    setTimeout(()=>{
      overlay.classList.add("hidden");
      inBattle = false;
      currentWild = null;
      document.getElementById("battle-img").src="";
    },400);
  }

  function catchWild(chance=0.5){
    if(!inBattle||!currentWild) return false;
    if(Math.random()<chance){
      console.log(`You caught ${currentWild.name} Lv${currentWild.lvl}! 🎉`);
      endBattle();
      return true;
    } else {
      console.log(`${currentWild.name} escaped!`);
      endBattle();
      return false;
    }
  }

  function runWild(){
    if(!inBattle||!currentWild) return false;
    console.log(`You ran away from ${currentWild.name}!`);
    endBattle();
    return true;
  }

  document.getElementById("catch-btn").addEventListener("click",()=>catchWild(0.5));
  document.getElementById("run-btn").addEventListener("click",()=>runWild());

  // --- add/replace with two-player movement & drawing ---

  // Two players: player 1 uses WASD, player 2 uses Arrow keys
  const players = [
    { id: 1, x: 60,  y: 140, size: 28, color: '#2b8cff', keys: { up: 'w', left: 'a', down: 's', right: 'd' } },
    { id: 2, x: 420, y: 140, size: 28, color: '#ff4b4b', keys: { up: 'ArrowUp', left: 'ArrowLeft', down: 'ArrowDown', right: 'ArrowRight' } }
  ];

  const speed = 2.4;
  const keysDown = {};

  // global key tracking for both players
  window.addEventListener('keydown', e => { keysDown[e.key] = true; });
  window.addEventListener('keyup',   e => { keysDown[e.key] = false; });

  // call this from your existing game update loop (replace single-player move code)
  function updatePlayers() {
    players.forEach(p => {
      if (keysDown[p.keys.left])  p.x -= speed;
      if (keysDown[p.keys.right]) p.x += speed;
      if (keysDown[p.keys.up])    p.y -= speed;
      if (keysDown[p.keys.down])  p.y += speed;

      // clamp to canvas bounds
      p.x = Math.max(0, Math.min(canvas.width - p.size, p.x));
      p.y = Math.max(0, Math.min(canvas.height - p.size, p.y));
    });
  }

  // call this from your existing draw/render step (replace single-player draw code)
  function drawPlayers() {
    players.forEach(p => {
      // body
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      // border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      // small facing indicator (eye) - optional visual flair
      ctx.fillStyle = '#000';
      ctx.fillRect(Math.round(p.x + p.size/2 - 2), Math.round(p.y + p.size/2 - 2), 4, 4);
    });
  }

  function update(dt){
    if(inBattle) return;
    if(encounterCooldown>0) encounterCooldown-=dt;

    player.vx = player.vy = 0;
    if(keys['ArrowLeft']||keys['a']) player.vx=-1;
    if(keys['ArrowRight']||keys['d']) player.vx=1;
    if(keys['ArrowUp']||keys['w']) player.vy=-1;
    if(keys['ArrowDown']||keys['s']) player.vy=1;

    if(player.vx && player.vy){player.vx*=Math.SQRT1_2; player.vy*=Math.SQRT1_2;}

    const nextX = player.x + player.vx*player.speed*dt;
    const nextY = player.y + player.vy*player.speed*dt;
    if(canWalkTo(nextX,player.y)) player.x=nextX;
    if(canWalkTo(player.x,nextY)) player.y=nextY;

    if(player.vx || player.vy) checkEncounter(player.x,player.y);

    updatePlayers();
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const camX = Math.max(0,Math.min(player.x-VIEW_W/2,mapW*TILE-VIEW_W));
    const camY = Math.max(0,Math.min(player.y-VIEW_H/2,mapH*TILE-VIEW_H));

    for(let ty=0;ty<mapH;ty++){
      for(let tx=0;tx<mapW;tx++){
        const t = tileAt(tx,ty);
        ctx.fillStyle = tileset[t];
        ctx.fillRect(tx*TILE-camX,ty*TILE-camY,TILE,TILE);
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.strokeRect(tx*TILE-camX,ty*TILE-camY,TILE,TILE);
      }
    }

    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.fillRect(player.x-player.w/2-camX,player.y-player.h/2+player.h*0.6-camY,player.w,6);

    ctx.fillStyle='#ffde57';
    ctx.fillRect(player.x-player.w/2-camX,player.y-player.h/2-camY,player.w,player.h);

    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.fillRect(8,8,160,40);
    ctx.fillStyle='#fff';
    ctx.font='14px monospace';
    ctx.fillText('Mini Pokémon — arrows or WASD',14,32);

    drawPlayers();
  }

  function loop(ts){
    const dt = Math.min(0.05,(ts-lastTime)/1000);
    lastTime=ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

});
