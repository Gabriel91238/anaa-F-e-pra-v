const musica = document.getElementById('musica');
let pulse = 0; // Variável para o batimento

function toggleMusica() {
    if (musica.paused) {
        if (musica.currentTime === 0) musica.currentTime = 60;
        musica.play();
        document.getElementById('btnMusica').innerText = "🎵 Som: ON";
    } else {
        musica.pause();
        document.getElementById('btnMusica').innerText = "🎵 Som: OFF";
    }
}

function proximaPagina() {
    document.getElementById('pagina1').style.display = 'none';
    document.getElementById('pagina2').style.display = 'block';
    startParticles();
    habilitarArrastar();
    criarChuva(); 
}

function criarCoracaoExplosao(e) {
    const coracao = document.createElement('div');
    coracao.className = 'click-heart';
    coracao.innerHTML = '❤️';
    coracao.style.left = (e.clientX || (e.touches && e.touches[0].clientX)) + 'px';
    coracao.style.top = (e.clientY || (e.touches && e.touches[0].clientY)) + 'px';
    document.getElementById('pagina2').appendChild(coracao);
    setTimeout(() => coracao.remove(), 1000);
}

function criarChuva() {
    const container = document.getElementById('chuva');
    const flores = ['🌸', '🌺', '🌹', '🌷', '✨'];
    setInterval(() => {
        const flor = document.createElement('div');
        flor.className = 'flor';
        flor.innerText = flores[Math.floor(Math.random() * flores.length)];
        flor.style.left = Math.random() * 100 + 'vw';
        flor.style.fontSize = (Math.random() * 20 + 15) + 'px';
        flor.style.animationDuration = (Math.random() * 3 + 2) + 's'; 
        container.appendChild(flor);
        setTimeout(() => flor.remove(), 5000);
    }, 150); 
}

function habilitarArrastar() {
    const fotos = document.querySelectorAll('.foto-mural');
    fotos.forEach(foto => {
        let isDragging = false; let x, y;
        const start = (e) => {
            isDragging = true;
            const ev = e.touches ? e.touches[0] : e;
            x = ev.clientX - foto.offsetLeft; y = ev.clientY - foto.offsetTop;
            foto.style.zIndex = 1000;
        };
        const move = (e) => {
            if (!isDragging) return;
            const ev = e.touches ? e.touches[0] : e;
            foto.style.left = (ev.clientX - x) + 'px'; foto.style.top = (ev.clientY - y) + 'px';
        };
        foto.addEventListener('mousedown', start); foto.addEventListener('touchstart', start);
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move);
        document.addEventListener('mouseup', () => isDragging = false); document.addEventListener('touchend', () => isDragging = false);
    });
}

function startParticles() {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particles = [];
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const upd = (e) => { const ev = e.touches ? e.touches[0] : e; mouse.x = ev.clientX; mouse.y = ev.clientY; };
    window.addEventListener('mousemove', upd); window.addEventListener('touchmove', upd);

    // Texto em partículas brancas
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("EU TE AMO, ANA", canvas.width / 2, canvas.height / 2 - 80); 
    const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 5) {
        for (let x = 0; x < canvas.width; x += 5) {
            if (textData.data[(y * canvas.width + x) * 4 + 3] > 128) {
                particles.push(new Particle(x, y, '#ffffff', false));
            }
        }
    }

    // Coração cheio de partículas vermelhas
    const heartScale = window.innerWidth < 600 ? 10 : 15;
    ctx.fillStyle = "red";
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        const tx = heartScale * 16 * Math.pow(Math.sin(t), 3);
        const ty = -heartScale * (13 * Math.cos(t) - 5 * Math.
cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const finalX = tx + canvas.width/2; const finalY = ty + canvas.height/2 + 50;
        if (t === 0) ctx.moveTo(finalX, finalY); else ctx.lineTo(finalX, finalY);
    }
    ctx.fill();
    const heartData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 5) {
        for (let x = 0; x < canvas.width; x += 5) {
            if (heartData.data[(y * canvas.width + x) * 4 + 3] > 128) {
                particles.push(new Particle(x, y, '#ff1744', true)); // Marcar como parte do coração para pulsar
            }
        }
    }

    function Particle(tx, ty, color, isHeart) {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.targetX = tx; this.targetY = ty; this.baseX = tx; this.baseY = ty;
        this.color = color; this.isHeart = isHeart;
        this.vx = 0; this.vy = 0;

        this.update = function() {
            // Lógica do Batimento (Pulso)
            if(this.isHeart) {
                let s = 1 + Math.sin(pulse) * 0.05;
                this.targetX = canvas.width/2 + (this.baseX - canvas.width/2) * s;
                this.targetY = (canvas.height/2 + 50) + (this.baseY - (canvas.height/2 + 50)) * s;
            }

            this.vx += (this.targetX - this.x) * 0.015; this.vy += (this.targetY - this.y) * 0.015;
            let d = Math.sqrt((mouse.x - this.x)**2 + (mouse.y - this.y)**2);
            if (d < 70) { this.vx -= (mouse.x - this.x) * 0.2; this.vy -= (mouse.y - this.y) * 0.2; }
            this.vx *= 0.85; this.vy *= 0.85; this.x += this.vx; this.y += this.vy;
        };
        this.draw = function() {
            ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2); ctx.fill();
        };
    }

    function animate() {
        pulse += 0.05; // Velocidade do batimento
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}
