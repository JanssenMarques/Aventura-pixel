const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const imagemJogadorParado = new Image();
imagemJogadorParado.src = "sprites/jogador/parado.png";
const spritesJogador = {
    paradoDireita: imagemJogadorParado,
    paradoEsquerda: new Image(),
    movimentoDireita: new Image(),
    movimentoEsquerda: new Image(),
    atirandoDireita: new Image(),
    atirandoEsquerda: new Image(),
    agachadoParadoDireita: new Image(),
    agachadoParadoEsquerda: new Image(),
    agachadoDashDireita: new Image(),
    agachadoDashEsquerda: new Image()
};

spritesJogador.paradoEsquerda.src = "sprites/jogador/parado_esquerda.png";
spritesJogador.movimentoDireita.src = "sprites/jogador/movimento_direita.png";
spritesJogador.movimentoEsquerda.src = "sprites/jogador/movimento_esquerda.png";
spritesJogador.atirandoDireita.src = "sprites/jogador/atirando_direita.png";
spritesJogador.atirandoEsquerda.src = "sprites/jogador/atirando_esquerda.png";
spritesJogador.agachadoParadoDireita.src = "sprites/jogador/agachadoParado_direita.png";
spritesJogador.agachadoParadoEsquerda.src = "sprites/jogador/agachadoParado_esquerda.png";
spritesJogador.agachadoDashDireita.src = "sprites/jogador/agachadoDash_direita.png";
spritesJogador.agachadoDashEsquerda.src = "sprites/jogador/agachadoDash_esquerda.png";

const spritesBoss = {
    direita: new Image(),
    esquerda: new Image()
};

spritesBoss.direita.src = "sprites/boss/ney_direita.png";
spritesBoss.esquerda.src = "sprites/boss/ney_esquerda.png";

const spritesInimigos = {
    direita: new Image(),
    esquerda: new Image()
};

spritesInimigos.direita.src = "sprites/inimigos/atirando_direita.png";
spritesInimigos.esquerda.src = "sprites/inimigos/atirando_esquerda.png";

let atirandoAte = 0;

const mundo = {
    largura: 2400,
    altura: 800
};
const camera = {
    x: 0,
    y: 0
};

function desenharChao() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 350, mundo.largura, 50);
}

function desenharContador() {
    let tempoAtual = performance.now();
    let tempoDecorrido = (tempoAtual - inicioPartida) / 1000;

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Tempo: " + Math.floor(tempoDecorrido) + "s", 20, 30);
}

let inicioPartida = performance.now();
let ultimoTempo = performance.now();
let gameOver = false;
let jogoIniciado = false;

const jogador = {
    x: 100,
    y: 305,
    largura: 30,
    altura: 45,
    cor: "red",
    velocidadeY: 0,
    noChao: true,
    pulosRestantes: 2,
    agachado: false,
    resistencia: 100,
    resistenciaMaxima: 100,
    presoAte: 0,
    municao: 3,
    municaoMaxima: 3,
    intervaloRecarga: 2000,
    ultimaRecarga: performance.now()
};

const armadilhas = [];

let distanciaPercorrida = 0;

function criarArmadilha() {

    if (!jogador.noChao) {
        return;
    }

    armadilhas.push({
        x: jogador.x + jogador.largura / 2 - 2,
        y: jogador.y + jogador.altura - 4,
        largura: 4,
        altura: 4,
        cor: "orange",
        criadaEm: performance.now(),
        jogadorSaiu: false
    });
}

function desenharArmadilhas() {

    for (const armadilha of armadilhas) {

        ctx.fillStyle = armadilha.cor;

        ctx.fillRect(
            armadilha.x,
            armadilha.y,
            armadilha.largura,
            armadilha.altura
        );
    }
}

function atualizarArmadilhas() {

    const agora = performance.now();

    for (let i = armadilhas.length - 1; i >= 0; i--) {

        const armadilha = armadilhas[i];

        if (agora - armadilha.criadaEm >= 5000) {
            armadilhas.splice(i, 1);
        }
    }
}

function verificarColisaoArmadilhas() {

    const agora = performance.now();

    for (let i = armadilhas.length - 1; i >= 0; i--) {

        const a = armadilhas[i];

        const colisaoBoss =
            boss.x < a.x + a.largura &&
            boss.x + boss.largura > a.x &&
            boss.y < a.y + a.altura &&
            boss.y + boss.altura > a.y;

        const colisaoJogador =
            jogador.x < a.x + a.largura &&
            jogador.x + jogador.largura > a.x &&
            jogador.y < a.y + a.altura &&
            jogador.y + jogador.altura > a.y;

        if (colisaoBoss) {

            boss.presoAte = agora + 500;
            armadilhas.splice(i, 1);

        } else if (colisaoJogador) {

            if (a.jogadorSaiu) {
                console.log("JOGADOR PRESO");
                jogador.presoAte = agora + 1000;
                armadilhas.splice(i, 1);
            }

        }
        if (!colisaoJogador) {
            a.jogadorSaiu = true;
        }
    }
}

const inimigos = [];

let ultimoSpawn = performance.now();
const limiteInimigos = 6;

const itensRecuperacao = [];

const configuracaoInimigos = {
    largura: 20,
    altura: 25,
    cor: "blue",
    vida: 1,
    intervaloDisparo: 2000
};

function criarInimigo(x, y) {

    inimigos.push({
        x: x,
        y: y,
        largura: configuracaoInimigos.largura,
        altura: configuracaoInimigos.altura,
        cor: configuracaoInimigos.cor,
        vida: configuracaoInimigos.vida,
        ultimoDisparo: performance.now()
    });
}

function criarInimigoAleatorio() {

    const indice = Math.floor(Math.random() * plataformas.length);

    const plataforma = plataformas[indice];

    const x = plataforma.x +
        (plataforma.largura - configuracaoInimigos.largura) / 2;

    const y = plataforma.y - configuracaoInimigos.altura;

    criarInimigo(x, y);
}

function controlarSpawnInimigos() {

    const agora = performance.now();
    const resistencia = jogador.resistencia;

    let intervalo;

    if (resistencia > 75) {
        intervalo = 3000;
    } else if (resistencia > 50) {
        intervalo = 5000;
    } else if (resistencia > 25) {
        intervalo = 7000;
    } else if (resistencia > 0) {
        intervalo = 10000;
    } else {
        return;
    }

    if (inimigos.length >= limiteInimigos) {
        return;
    }

    if (agora - ultimoSpawn >= intervalo) {

        criarInimigoAleatorio();

        ultimoSpawn = agora;
    }
}

function criarItemRecuperacao(inimigo) {
    itensRecuperacao.push({
        x: inimigo.x + inimigo.largura / 2 - 5,
        y: inimigo.y + inimigo.altura - 10,
        largura: 10,
        altura: 10,
        cor: "lime"
    });
}

function desenharItensRecuperacao() {
    for (const item of itensRecuperacao) {
        ctx.fillStyle = item.cor;
        ctx.fillRect(
            item.x,
            item.y,
            item.largura,
            item.altura
        );
    }
}

function coletarItensRecuperacao() {

    for (let i = itensRecuperacao.length - 1; i >= 0; i--) {

        const item = itensRecuperacao[i];

        const colisao =
            jogador.x < item.x + item.largura &&
            jogador.x + jogador.largura > item.x &&
            jogador.y < item.y + item.altura &&
            jogador.y + jogador.altura > item.y;

        if (colisao) {

            jogador.resistencia = Math.min(
                jogador.resistencia + 12,
                jogador.resistenciaMaxima
            );

            itensRecuperacao.splice(i, 1);
        }
    }
}


function desenharInimigos() {

    for (const inimigo of inimigos) {

        const olhandoEsquerda = jogador.x < inimigo.x;

        const imagem = olhandoEsquerda
            ? spritesInimigos.esquerda
            : spritesInimigos.direita;

        const larguraVisual = 40;
        const alturaVisual = 35;

        const xVisual = inimigo.x -
            (larguraVisual - inimigo.largura) / 2;

        const yVisual = inimigo.y +
            inimigo.altura / 2 -
            alturaVisual / 2;

        if (imagem.complete && imagem.naturalWidth > 0) {

            ctx.drawImage(
                imagem,
                xVisual,
                yVisual,
                larguraVisual,
                alturaVisual
            );

        } else {

            ctx.fillStyle = inimigo.cor;

            ctx.fillRect(
                inimigo.x,
                inimigo.y,
                inimigo.largura,
                inimigo.altura
            );
        }
    }
}

function inimigosAtirar() {
    const agora = performance.now();

    for (const inimigo of inimigos) {

        if (agora - inimigo.ultimoDisparo >= configuracaoInimigos.intervaloDisparo) {

            const direcao = jogador.x < inimigo.x ? -1 : 1;

            projeteisInimigos.push({
                x: inimigo.x + inimigo.largura / 2,
                y: inimigo.y + inimigo.altura / 2,
                largura: 8,
                altura: 4,
                velocidadeX: direcao * 4,
                cor: "cyan"
            });

            inimigo.ultimoDisparo = agora;
        }
    }
}

function movimentarProjeteisInimigos() {

    for (let i = projeteisInimigos.length - 1; i >= 0; i--) {

        const projetil = projeteisInimigos[i];

        projetil.x += projetil.velocidadeX;

        const objetos = [...plataformas, ...obstaculos];

        let atingiuObstaculo = false;

        for (const p of objetos) {

            const colisaoHorizontal =
                projetil.x < p.x + p.largura &&
                projetil.x + projetil.largura > p.x;

            const colisaoVertical =
                projetil.y < p.y + p.altura &&
                projetil.y + projetil.altura > p.y;

            if (colisaoHorizontal && colisaoVertical) {
                atingiuObstaculo = true;
                break;
            }
        }

        if (atingiuObstaculo) {
            projeteisInimigos.splice(i, 1);
            continue;
        }

        if (
            projetil.x + projetil.largura < 0 ||
            projetil.x > mundo.largura
        ) {
            projeteisInimigos.splice(i, 1);
        }
    }
}

function verificarColisaoTirosInimigos() {

    for (let i = projeteisInimigos.length - 1; i >= 0; i--) {

        const projetil = projeteisInimigos[i];

        const colisao =
            projetil.x < jogador.x + jogador.largura &&
            projetil.x + projetil.largura > jogador.x &&
            projetil.y < jogador.y + jogador.altura &&
            projetil.y + projetil.altura > jogador.y;

        if (colisao) {

            jogador.resistencia -= 10;

            if (jogador.resistencia < 0) {
                jogador.resistencia = 0;
            }

            projeteisInimigos.splice(i, 1);
        }
    }
}

function desenharProjeteisInimigos() {
    for (const projetil of projeteisInimigos) {
        ctx.fillStyle = projetil.cor;
        ctx.fillRect(
            projetil.x,
            projetil.y,
            projetil.largura,
            projetil.altura
        );
    }
}

const projeteisJogador = [];
const projeteisInimigos = [];

const boss = {
    x: 2380,
    y: 300,
    largura: 20,
    altura: 30,
    cor: "purple",
    velocidade: 1.5,
    velocidadeY: 0,
    noChao: false,
    modo: "perseguindo",
    destinoX: 0,
    destinoY: 0,
    contornando: false,
    limiteObstaculo: 0,
    descendo: false,
    destinoDescidaX: 0,
    plataformaDescida: null,
    obstaculoAtual: null,
    etapaSubida: "sair",
    presoAte: 0
};

function desenharBoss() {

    const olhandoEsquerda = jogador.x < boss.x;

    const imagem = olhandoEsquerda
        ? spritesBoss.esquerda
        : spritesBoss.direita;

    const larguraVisual = 100;
    const alturaVisual = 80;

    const xVisual = boss.x -
        (larguraVisual - boss.largura) / 2;

    const yVisual = boss.y +
        boss.altura / 2 -
        alturaVisual / 2;

    if (imagem.complete && imagem.naturalWidth > 0) {

        ctx.drawImage(
            imagem,
            xVisual,
            yVisual,
            larguraVisual,
            alturaVisual
        );

    } else {

        ctx.fillStyle = boss.cor;

        ctx.fillRect(
            boss.x,
            boss.y,
            boss.largura,
            boss.altura
        );
    }
}

function desenharGameOver() {

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.textAlign = "left";
}

function verificarGameOver() {

    const colisao =
        boss.x < jogador.x + jogador.largura &&
        boss.x + boss.largura > jogador.x &&
        boss.y < jogador.y + jogador.altura &&
        boss.y + boss.altura > jogador.y;

    if (colisao) {
        gameOver = true;
    }
}

function podeMoverBoss(novoX, novoY) {
    const objetos = [...plataformas, ...obstaculos];

    for (const p of objetos) {
        const colisaoHorizontal =
            novoX < p.x + p.largura &&
            novoX + boss.largura > p.x;

        const colisaoVertical =
            novoY < p.y + p.altura &&
            novoY + boss.altura > p.y;

        if (colisaoHorizontal && colisaoVertical) {
            return false;
        }
    }

    if (novoY + boss.altura > 350) {
        return false;
    }

    return true;
}

function atualizarVelocidadeBoss() {

    const distancia = Math.hypot(
        jogador.x - boss.x,
        jogador.y - boss.y
    );

    if (distancia <= 100) {
        boss.velocidade = 2.5;
    } else if (distancia <= 200) {
        boss.velocidade = 2;
    } else if (distancia <= 350) {
        boss.velocidade = 1.7;
    } else {
        boss.velocidade = 1.5;
    }
}

function movimentarBoss() {
    if (performance.now() < boss.presoAte) {
        boss.velocidade = 0.3;
    } else {
        boss.velocidade = 1.5;
    }
    const objetos = [...plataformas, ...obstaculos];

    const destinoX = jogador.x;
    const destinoY = Math.min(
        jogador.y + jogador.altura - boss.altura,
        350 - boss.altura
    );

    function passoAte(atual, destino) {
        return Math.sign(destino - atual) *
            Math.min(boss.velocidade, Math.abs(destino - atual));
    }

    if (boss.modo === "subindo") {
        const p = boss.obstaculoAtual;

        if (boss.etapaSubida === "sair") {
            const esquerda = p.x - boss.largura - 2;
            const direita = p.x + p.largura + 2;

            const destinoLateral =
                boss.x + boss.largura / 2 < p.x + p.largura / 2
                    ? esquerda
                    : direita;

            const passo = passoAte(boss.x, destinoLateral);

            if (podeMoverBoss(boss.x + passo, boss.y)) {
                boss.x += passo;
            }

            if (Math.abs(boss.x - destinoLateral) < 0.01) {
                boss.etapaSubida = "subir";
            }

            return;
        }

        if (boss.etapaSubida === "subir") {
            const alturaAlvo = p.y - boss.altura - 2;
            const passo = passoAte(boss.y, alturaAlvo);

            if (podeMoverBoss(boss.x, boss.y + passo)) {
                boss.y += passo;
            }

            if (Math.abs(boss.y - alturaAlvo) < 0.01) {
                boss.etapaSubida = "atravessar";
            }

            return;
        }

        if (boss.etapaSubida === "atravessar") {
            const passo = passoAte(boss.x, boss.destinoX);

            if (podeMoverBoss(boss.x + passo, boss.y)) {
                boss.x += passo;
            }

            if (Math.abs(boss.x - boss.destinoX) < 0.01) {
                boss.modo = "perseguindo";
                boss.obstaculoAtual = null;
                boss.etapaSubida = "sair";
            }

            return;
        }
    }

    if (boss.modo === "descendo") {
        const p = boss.obstaculoAtual;
        
        if (Math.abs(boss.x - boss.destinoX) > 0.01) {
            const passo = passoAte(boss.x, boss.destinoX);

            if (podeMoverBoss(boss.x + passo, boss.y)) {
                boss.x += passo;
            }

            return;
        }
        
        const alturaSaida = Math.min(
            p.y + p.altura,
            350 - boss.altura
        );

        if (boss.y < alturaSaida) {
            const passo = passoAte(boss.y, alturaSaida);

            if (podeMoverBoss(boss.x, boss.y + passo)) {
                boss.y += passo;
            }

            return;
        }

        boss.modo = "perseguindo";
        boss.obstaculoAtual = null;
        return;
    }

    const movimentoX = passoAte(boss.x, destinoX);
    const movimentoY = passoAte(boss.y, destinoY);

    if (movimentoX !== 0) {
        if (podeMoverBoss(boss.x + movimentoX, boss.y)) {
            boss.x += movimentoX;
        } else {
            for (const p of objetos) {
                const horizontal =
                    boss.x + movimentoX < p.x + p.largura &&
                    boss.x + movimentoX + boss.largura > p.x;

                const vertical =
                    boss.y < p.y + p.altura &&
                    boss.y + boss.altura > p.y;

                if (horizontal && vertical) {
                    boss.modo = "subindo";
                    boss.obstaculoAtual = p;
                    boss.etapaSubida = "sair";

                    boss.destinoX = movimentoX < 0
                        ? p.x - boss.largura - 2
                        : p.x + p.largura + 2;

                    return;
                }
            }
        }
    }

    if (movimentoY !== 0) {
        if (podeMoverBoss(boss.x, boss.y + movimentoY)) {
            boss.y += movimentoY;

        } else if (movimentoY < 0) {

            for (const p of objetos) {

                const colisaoHorizontal =
                    boss.x < p.x + p.largura &&
                    boss.x + boss.largura > p.x;

                const colisaoVertical =
                    boss.y + movimentoY < p.y + p.altura &&
                    boss.y + movimentoY + boss.altura > p.y;

                if (colisaoHorizontal && colisaoVertical) {

                    boss.obstaculoAtual = p;
                    boss.modo = "subindo";
                    boss.etapaSubida = "sair";
                    
                    boss.destinoX =
                        jogador.x < boss.x
                            ? p.x - boss.largura - 2
                            : p.x + p.largura + 2;

                    return;
                }
            }
        } else if (movimentoY > 0) {
            for (const p of objetos) {
                const horizontal =
                    boss.x < p.x + p.largura &&
                    boss.x + boss.largura > p.x;

                const vertical =
                    boss.y + movimentoY < p.y + p.altura &&
                    boss.y + movimentoY + boss.altura > p.y;

                if (horizontal && vertical) {
                    const esquerda = p.x - boss.largura - 2;
                    const direita = p.x + p.largura + 2;

                    boss.destinoX =
                        Math.abs(jogador.x - esquerda) <
                            Math.abs(jogador.x - direita)
                            ? esquerda
                            : direita;

                    boss.obstaculoAtual = p;
                    boss.modo = "descendo";
                    return;
                }
            }
        }
    }
}

function atualizarFisicaBoss() {
    const yAnterior = boss.y;

    boss.velocidadeY += gravidade;
    boss.y += boss.velocidadeY;

    boss.noChao = false;

    const objetos = [...plataformas, ...obstaculos];

    for (const p of objetos) {
        const colisaoHorizontal =
            boss.x + boss.largura > p.x &&
            boss.x < p.x + p.largura;

        if (!colisaoHorizontal) {
            continue;
        }

        if (
            boss.velocidadeY >= 0 &&
            yAnterior + boss.altura <= p.y &&
            boss.y + boss.altura >= p.y
        ) {
            boss.y = p.y - boss.altura;
            boss.velocidadeY = 0;
            boss.noChao = true;
        }

        else if (
            boss.velocidadeY < 0 &&
            yAnterior >= p.y + p.altura &&
            boss.y <= p.y + p.altura
        ) {
            boss.y = p.y + p.altura;
            boss.velocidadeY = 0;
        }
    }

    if (boss.y + boss.altura >= 350) {
        boss.y = 350 - boss.altura;
        boss.velocidadeY = 0;
        boss.noChao = true;
    }
}


const plataformas = [
    // Início: saltos acessíveis
    { x: 0, y: 225, largura: 120, altura: 15, cor: "brown" },//0
    { x: 190, y: 290, largura: 120, altura: 15, cor: "brown" },//1
    { x: 190, y: 140, largura: 120, altura: 15, cor: "brown" },//1
    { x: 410, y: 225, largura: 120, altura: 15, cor: "brown" },//2
    { x: 640, y: 290, largura: 130, altura: 15, cor: "brown" },//3
    { x: 640, y: 130, largura: 130, altura: 15, cor: "brown" },//3

    // Região intermediária: maior variação de altura
    { x: 880, y: 210, largura: 130, altura: 15, cor: "brown" },//4
    { x: 1110, y: 285, largura: 140, altura: 15, cor: "brown" },//5
    { x: 1110, y: 135, largura: 140, altura: 15, cor: "brown" },//5
    { x: 1350, y: 195, largura: 130, altura: 15, cor: "brown" },//6

    // Região avançada
    { x: 1580, y: 280, largura: 140, altura: 15, cor: "brown" },//7
    { x: 1580, y: 130, largura: 140, altura: 15, cor: "brown" },//7
    { x: 1810, y: 205, largura: 130, altura: 15, cor: "brown" },//8

    // Final
    { x: 2040, y: 285, largura: 140, altura: 15, cor: "brown" },//9
    { x: 2040, y: 135, largura: 140, altura: 15, cor: "brown" },//9
    { x: 2260, y: 220, largura: 120, altura: 15, cor: "brown" }//10
];

const obstaculos = [
    // Início: barreiras baixas
    { x: 430, y: 330, largura: 25, altura: 20, cor: "darkgreen" },
    

    // Região intermediária
    { x: 950, y: 320, largura: 35, altura: 30, cor: "darkgreen" },
    { x: 1400, y: 315, largura: 35, altura: 35, cor: "darkgreen" },

    // Região avançada
    { x: 1850, y: 310, largura: 40, altura: 40, cor: "darkgreen" },
    

    // Final do cenário
    { x: 2300, y: 315, largura: 40, altura: 35, cor: "darkgreen" }
];


function desenharObstaculos() {
    for (const o of obstaculos) {
        ctx.fillStyle = o.cor;

        ctx.fillRect(o.x, o.y, o.largura, o.altura);
    }
}

function desenharPlataformas() {
    for (const p of plataformas) {
        ctx.fillStyle = p.cor;
        ctx.fillRect(p.x, p.y, p.largura, p.altura);
    }
}

const gravidade = 0.5;

const teclas = {
    direita: false,
    esquerda: false,
    ultimaDirecao: null,
    pulo: false,
    puloAnterior: false,
    baixo: false,
    correr: false,
    atirar: false
}

function desenharResistencia() {
    ctx.fillStyle = "black";
    ctx.fillRect(20, 45, 204, 24);

    ctx.fillStyle = "red";
    ctx.fillRect(22, 47, 200, 20);

    ctx.fillStyle = "limegreen";
    ctx.fillRect(
        22,
        47,
        200 * (jogador.resistencia / jogador.resistenciaMaxima),
        20
    );

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(
        `Resistência: ${Math.ceil(jogador.resistencia)}`,
        28,
        62
    );
}

function desenharMunicao() {

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";

    ctx.fillText(
        "Munição: " + jogador.municao + "/" + jogador.municaoMaxima,
        20,
        95
    );
}

function atualizarResistencia() {
    const tempoAtual = performance.now();
    const deltaTime = (tempoAtual - ultimoTempo) / 1000;

    ultimoTempo = tempoAtual;

    let consumo = 0;

    if (teclas.direita || teclas.esquerda) {
        consumo = 1.5;

        if (teclas.correr) {
            consumo = 5;
        }
    }

    jogador.resistencia -= consumo * deltaTime;

    if (jogador.resistencia < 0) {
        jogador.resistencia = 0;
    }
}

function recarregarMunicao() {

    const agora = performance.now();

    if (
        jogador.municao < jogador.municaoMaxima &&
        agora - jogador.ultimaRecarga >= jogador.intervaloRecarga
    ) {
        jogador.municao += 1;
        jogador.ultimaRecarga = agora;
    }
}

function atirar() {

    const direcao = teclas.ultimaDirecao === "esquerda" ? -1 : 1;

    projeteisJogador.push({
        x: direcao === 1
            ? jogador.x + jogador.largura
            : jogador.x - 8,
        y: jogador.y + jogador.altura / 2,
        largura: 8,
        altura: 4,
        velocidadeX: direcao * 7,
        cor: "yellow"
    });

    atirandoAte = performance.now() + 200;

    if (jogador.municao === jogador.municaoMaxima) {
        jogador.ultimaRecarga = performance.now();
    }

}

function movimentarProjeteisJogador() {

    for (let i = projeteisJogador.length - 1; i >= 0; i--) {

        const projetil = projeteisJogador[i];

        projetil.x += projetil.velocidadeX;

        let atingiuInimigo = false;

        for (let j = inimigos.length - 1; j >= 0; j--) {

            const inimigo = inimigos[j];

            const colisao =
                projetil.x < inimigo.x + inimigo.largura &&
                projetil.x + projetil.largura > inimigo.x &&
                projetil.y < inimigo.y + inimigo.altura &&
                projetil.y + projetil.altura > inimigo.y;

            if (colisao) {

                inimigo.vida -= 1;

                if (inimigo.vida <= 0) {
                    criarItemRecuperacao(inimigo);
                    inimigos.splice(j, 1);
                }

                projeteisJogador.splice(i, 1);
                atingiuInimigo = true;
                break;
            }
        }

        if (atingiuInimigo) {
            continue;
        }

        const objetos = [...plataformas, ...obstaculos];

        let atingiuObstaculo = false;

        for (const p of objetos) {

            const colisaoHorizontal =
                projetil.x < p.x + p.largura &&
                projetil.x + projetil.largura > p.x;

            const colisaoVertical =
                projetil.y < p.y + p.altura &&
                projetil.y + projetil.altura > p.y;

            if (colisaoHorizontal && colisaoVertical) {
                atingiuObstaculo = true;
                break;
            }
        }

        if (atingiuObstaculo) {
            projeteisJogador.splice(i, 1);
            continue;
        }

        const colisaoBoss =
            projetil.x < boss.x + boss.largura &&
            projetil.x + projetil.largura > boss.x &&
            projetil.y < boss.y + boss.altura &&
            projetil.y + projetil.altura > boss.y;

        if (colisaoBoss) {

            boss.presoAte = performance.now() + 1000;

            projeteisJogador.splice(i, 1);
            continue;
        }

        if (
            projetil.x + projetil.largura < 0 ||
            projetil.x > mundo.largura
        ) {
            projeteisJogador.splice(i, 1);
        }
    }
}

function desenharProjeteisJogador() {

    for (const projetil of projeteisJogador) {

        ctx.fillStyle = projetil.cor;

        ctx.fillRect(
            projetil.x,
            projetil.y,
            projetil.largura,
            projetil.altura
        );
    }
}

function atualizarCamera() {
    camera.x = jogador.x - canvas.width / 2;

    if (camera.x < 0) {
        camera.x = 0;
    }

    if (camera.x > mundo.largura - canvas.width) {
        camera.x = mundo.largura - canvas.width;
    }
}

function desenharJogador() {

    const esquerda = teclas.esquerda ||
        (!teclas.direita && teclas.ultimaDirecao === "esquerda");

    const movimentando = teclas.direita || teclas.esquerda;

    let imagem;

    if (jogador.agachado) {

        if (movimentando) {
            imagem = esquerda
                ? spritesJogador.agachadoDashEsquerda
                : spritesJogador.agachadoDashDireita;
        } else {
            imagem = esquerda
                ? spritesJogador.agachadoParadoEsquerda
                : spritesJogador.agachadoParadoDireita;
        }

    } else if (performance.now() < atirandoAte) {

        imagem = esquerda
            ? spritesJogador.atirandoEsquerda
            : spritesJogador.atirandoDireita;

    } else if (movimentando) {

        imagem = esquerda
            ? spritesJogador.movimentoEsquerda
            : spritesJogador.movimentoDireita;

    } else {

        imagem = esquerda
            ? spritesJogador.paradoEsquerda
            : spritesJogador.paradoDireita;
    }

    const larguraVisual = jogador.agachado ? 30 : 70;
    const alturaVisual = jogador.agachado ? 35 : 50;

    const xVisual = jogador.x -
        (larguraVisual - jogador.largura) / 2;

    const yVisual = jogador.y +
        jogador.altura - alturaVisual + 3;

    if (imagem.complete && imagem.naturalWidth > 0) {

        ctx.drawImage(
            imagem,
            xVisual,
            yVisual,
            larguraVisual,
            alturaVisual
        );

    } else {

        ctx.fillStyle = jogador.cor;

        ctx.fillRect(
            jogador.x,
            jogador.y,
            jogador.largura,
            jogador.altura
        );
    }
}

function pular() {

    if (performance.now() < jogador.presoAte) {
        return;
    }

    if (jogador.pulosRestantes > 0) {
        jogador.velocidadeY = -8.5;
        jogador.noChao = false;
        jogador.pulosRestantes -= 1;
    }
}

function agachar() {
    if (jogador.noChao && !jogador.agachado) {
        jogador.altura = 30;
        jogador.y += 15;
        jogador.agachado = true;
    }
}

function levantar() {
    if (!jogador.agachado) {
        return;
    }

    const novaAltura = 45;
    const novoY = jogador.y + jogador.altura - novaAltura;

    const objetos = [...plataformas, ...obstaculos];

    for (const p of objetos) {
        const colisaoHorizontal =
            jogador.x < p.x + p.largura &&
            jogador.x + jogador.largura > p.x;

        const colisaoVertical =
            novoY < p.y + p.altura &&
            novoY + novaAltura > p.y;

        if (colisaoHorizontal && colisaoVertical) {
            return;
        }
    }

    jogador.y = novoY;
    jogador.altura = novaAltura;
    jogador.agachado = false;
}

function atualizarFisica() {
    jogador.velocidadeY += gravidade;
    jogador.y += jogador.velocidadeY;

    jogador.noChao = false;

    const objetos = [...plataformas, ...obstaculos];

    for (const p of objetos) {

        if (
            jogador.velocidadeY < 0 &&
            jogador.x + jogador.largura > p.x &&
            jogador.x < p.x + p.largura &&
            jogador.y <= p.y + p.altura &&
            jogador.y - jogador.velocidadeY >= p.y + p.altura
        ) {
            jogador.y = p.y + p.altura;
            jogador.velocidadeY = 0;
        }

        if (
            jogador.velocidadeY >= 0 &&
            jogador.x + jogador.largura > p.x &&
            jogador.x < p.x + p.largura &&
            jogador.y + jogador.altura >= p.y &&
            jogador.y + jogador.altura - jogador.velocidadeY <= p.y
        ) {
            jogador.y = p.y - jogador.altura;
            jogador.velocidadeY = 0;
            jogador.noChao = true;
            jogador.pulosRestantes = 2;
        }
    }

    if (jogador.y + jogador.altura >= 350) {
        jogador.y = 350 - jogador.altura;
        jogador.velocidadeY = 0;
        jogador.noChao = true;
        jogador.pulosRestantes = 2;
    }
}

function controlarAgachamento() {
    if (teclas.baixo) {
        agachar();
    } else {
        levantar();
    }
}

function verificarColisaoLateral(xAnterior) {
    const objetos = [...plataformas, ...obstaculos];

    for (const p of objetos) {
        if (
            jogador.y < p.y + p.altura &&
            jogador.y + jogador.altura > p.y
        ) {
            if (
                xAnterior + jogador.largura <= p.x &&
                jogador.x + jogador.largura > p.x
            ) {
                jogador.x = p.x - jogador.largura;
            }

            if (
                xAnterior >= p.x + p.largura &&
                jogador.x < p.x + p.largura
            ) {
                jogador.x = p.x + p.largura;
            }
        }
    }
}

function desenharTelaInicial() {

    ctx.fillStyle = "rgba(23, 33, 58, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    ctx.fillStyle = "yellow";
    ctx.font = "bold 42px Arial";
    ctx.fillText("AVENTURA PIXEL", canvas.width / 2, 70);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("REGRAS DO JOGO", canvas.width / 2, 115);

    ctx.font = "17px Arial";

    const regras = [
        "Setas esquerda e direita: movimentar",
        "Shift: correr",
        "Seta para cima ou Espaço: pular (até 2 vezes)",
        "Seta para baixo: agachar",
        "Ctrl: lançar bolas de energia",
        "Colete itens verdes para recuperar resistência",
        "Quanto mais resistência, mais inimigos aparecem",
        "Fuja do boss!!"
    ];

    regras.forEach((regra, indice) => {
        ctx.fillText(
            regra,
            canvas.width / 2,
            155 + indice * 27
        );
    });

    ctx.fillStyle = "yellow";
    ctx.font = "bold 20px Arial";
    ctx.fillText(
        "PRESSIONE QUALQUER TECLA PARA COMEÇAR",
        canvas.width / 2,
        canvas.height - 25
    );

    ctx.textAlign = "left";
}

function atualizarJogo() {

    if (!jogoIniciado) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        desenharChao();
        desenharPlataformas();
        desenharObstaculos();
        desenharJogador();
        desenharBoss();
        desenharInimigos();

        ctx.restore();

        desenharTelaInicial();

        requestAnimationFrame(atualizarJogo);
        return;
    }

    if (gameOver) {
        return;
    }

    controlarPulo();

    const xAnterior = jogador.x;

    movimentarJogador();
    if (jogador.resistencia <= 0) {

        distanciaPercorrida += Math.abs(jogador.x - xAnterior);

        if (distanciaPercorrida >= 80) {
            criarArmadilha();
            distanciaPercorrida -= 80;
        }

    } else {
        distanciaPercorrida = 0;
    }
    //atualizarVelocidadeBoss();
    movimentarBoss();
    verificarGameOver();
    movimentarProjeteisJogador();
    inimigosAtirar();
    controlarSpawnInimigos();
    movimentarProjeteisInimigos();
    verificarColisaoTirosInimigos();
    controlarAgachamento();
    atualizarFisica();
    verificarColisaoLateral(xAnterior);
    atualizarResistencia();
    coletarItensRecuperacao();
    recarregarMunicao();
    atualizarArmadilhas();
    verificarColisaoArmadilhas();

    // Atualização da câmera
    atualizarCamera();

    // Limpeza da tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenho do mundo
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    desenharChao();
    desenharPlataformas();
    desenharObstaculos();
    desenharArmadilhas();
    desenharJogador();
    desenharBoss();
    desenharInimigos()
    desenharItensRecuperacao();
    desenharProjeteisJogador();
    desenharProjeteisInimigos();

    ctx.restore();
    desenharResistencia();
    //desenharMunicao();

    // Elementos fixos na tela
    desenharContador();

    if (gameOver) {
        desenharGameOver();
    } else {
        requestAnimationFrame(atualizarJogo);
    }
}

function controlarPulo() {
    if (teclas.pulo && !teclas.puloAnterior) {
        pular();
    }

    if (teclas.pulo && jogador.noChao) {
        pular();
    }

    teclas.puloAnterior = teclas.pulo;
}

document.addEventListener("keydown", function (evento) {
    if (!jogoIniciado) {
        evento.preventDefault();

        jogoIniciado = true;

        inicioPartida = performance.now();
    }
    if (evento.key === "ArrowRight") {
        teclas.direita = true;
        if (!evento.repeat) {
            teclas.ultimaDirecao = "direita";
        }
    }

    if (evento.key === "ArrowLeft") {
        teclas.esquerda = true;
        if (!evento.repeat) {
            teclas.ultimaDirecao = "esquerda";
        }
    }

    if (evento.code === "ArrowUp") {
        evento.preventDefault();
        teclas.pulo = true;
    }

    if (evento.code === "ArrowDown") {
        evento.preventDefault();
        teclas.baixo = true;
    }

    if (evento.key === "Shift") {
        teclas.correr = true;
    }

    if (evento.key === "Control") {
        evento.preventDefault();

        if (!evento.repeat && !teclas.atirar) {
            teclas.atirar = true;
            atirar();
        }
    }
});

document.addEventListener("keyup", function (evento) {
    if (evento.key === "ArrowRight") {
        teclas.direita = false;
    }

    if (evento.key === "ArrowLeft") {
        teclas.esquerda = false;
    }

    if (evento.code === "ArrowUp") {
        evento.preventDefault();
        teclas.pulo = false;
    }

    if (evento.code === "ArrowDown") {
        teclas.baixo = false;
    }

    if (evento.key === "Shift") {
        teclas.correr = false;
    }

    if (evento.key === "Control") {
        teclas.atirar = false;
    }
});

function movimentarJogador() {

    if (performance.now() < jogador.presoAte) {
        console.log("MOVIMENTO BLOQUEADO");
        return;
    }

    let velocidade = 3;

    if (jogador.resistencia <= 0) {
        velocidade = 1;
    } else if (teclas.correr) {
        velocidade = 6;
    }

    if (teclas.direita && teclas.esquerda) {

        if (teclas.ultimaDirecao === "direita") {
            jogador.x += velocidade;
        } else {
            jogador.x -= velocidade;
        }
    } else if (teclas.direita) {
        jogador.x += velocidade;
    } else if (teclas.esquerda) {
        jogador.x -= velocidade;
    }

    if (jogador.x < 0) {
        jogador.x = 0;
    }

    if (jogador.x + jogador.largura > mundo.largura) {
        jogador.x = mundo.largura - jogador.largura;
    }



}

const botaoEsquerda = document.getElementById("btn-esquerda");
const botaoDireita = document.getElementById("btn-direita");

function configurarBotaoMovimento(botao, direcao) {
    botao.addEventListener("pointerdown", function (evento) {
        evento.preventDefault();

        botao.setPointerCapture(evento.pointerId);

        teclas[direcao] = true;
        teclas.ultimaDirecao = direcao;
    });

    function soltarBotao() {
        teclas[direcao] = false;
    }

    botao.addEventListener("pointerup", soltarBotao);
    botao.addEventListener("pointercancel", soltarBotao);
    botao.addEventListener("lostpointercapture", soltarBotao);
}

configurarBotaoMovimento(botaoEsquerda, "esquerda");
configurarBotaoMovimento(botaoDireita, "direita");


function configurarBotaoAcao(id, tecla) {
    const botao = document.getElementById(id);

    botao.addEventListener("pointerdown", function(evento) {
        evento.preventDefault();
        botao.setPointerCapture(evento.pointerId);

        teclas[tecla] = true;
    });

    function soltarBotao() {
        teclas[tecla] = false;
    }

    botao.addEventListener("pointerup", soltarBotao);
    botao.addEventListener("pointercancel", soltarBotao);
    botao.addEventListener("lostpointercapture", soltarBotao);
}

configurarBotaoAcao("btn-correr", "correr");
configurarBotaoAcao("btn-agachar", "baixo");
configurarBotaoAcao("btn-pular", "pulo");

const botaoAtirar = document.getElementById("btn-atirar");

botaoAtirar.addEventListener("pointerdown", function(evento) {
    evento.preventDefault();
    botaoAtirar.setPointerCapture(evento.pointerId);

    if (!teclas.atirar) {
        teclas.atirar = true;
        atirar();
    }
});

function soltarBotaoAtirar() {
    teclas.atirar = false;
}

botaoAtirar.addEventListener("pointerup", soltarBotaoAtirar);
botaoAtirar.addEventListener("pointercancel", soltarBotaoAtirar);
botaoAtirar.addEventListener("lostpointercapture", soltarBotaoAtirar);


canvas.addEventListener("pointerdown", function () {
    if (!jogoIniciado) {
        jogoIniciado = true;
        inicioPartida = performance.now();
    }
});

criarInimigo(450, 200);
atualizarJogo()

document.getElementById("btn-pular").addEventListener("pointerdown", function () {
    alert("O botão PULAR recebeu o toque!");
});
