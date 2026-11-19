// LAS ISLAS REALES — EL TERRENO EN PANTALLA (prototipo I0, docs/proyecto/ANALISIS_ISLAS_REALES.md).
//
// El dibujo de Dusk Patrol (repo rasantev2, render/shaders/world.js) traido ENTERO: una pasada de
// pantalla completa que, por cada pixel, marcha el rayo contra el mapa real + el relieve fino, y pinta
// tierra, agua, la capa de estratocumulos y el manto de nubes. Escribe la PROFUNDIDAD con la misma
// proyeccion que la camara de three (`depthFor`), asi el buque, los fx y todo lo que sea malla queda
// bien tapado por los cerros.
//
// TAL CUAL EL ORIGINAL (autor, 19/11: "que se vea tal cual el otro juego, con el avion cambiado"): los
// colores, la luz, la niebla, las nubes y la pasada final de paleta con dither son los de Dusk Patrol.
// Lo unico que no vino es su capa de guerra (pistas, crateres, escaras), y la sombra que proyecta es la
// planta de un A-4 en vez de la de su caza.
//
// Se cuelga de la escena del arena (systems/three-arena.js) como una malla mas, con renderOrder bajo
// y depthFunc ALWAYS: es el fondo y lo escribe todo; lo demas se prueba contra su profundidad.
import * as mundo from './mundo.js';

const THREE = window.THREE || null;

// LA PALETA DE DUSK PATROL (render/palette.js), tal cual: el cielo cubierto de 1982 sale de aca.
const PALETA = [
  '#120c1c', '#241a33', '#3a2b4d', '#54406a', '#6f5a84', '#8c7aa0', '#ab9cba', '#cbbfd2', '#ece4ea', '#fff8ec',
  '#2c2e5e', '#44468a', '#6a62a6', '#9384c0', '#b9a6d2', '#d8bfdc', '#f6d8b8', '#f3b98f', '#e99a6e', '#d9785a',
  '#b85a55', '#ffe7a8', '#fbcf6b', '#f0a640', '#fff3cf', '#a8e4d4', '#6ccabd', '#3aa3a6', '#237c8f', '#1b5a7a',
  '#183f66', '#142a4f', '#0e1b38', '#ecd2a0', '#d4b27c', '#d9cf96', '#b9b878', '#8f9460', '#6c7350', '#e2a43a',
  '#d97a2a', '#b2502a', '#a8323a', '#74253a', '#2f4a40', '#22333a', '#4b6450', '#9b8f8a', '#7a6d7c', '#a3a6ad',
  '#7d838e', '#5a6372', '#3c4250', '#d63a3a', '#ff7a2a', '#c48a3a', '#ff4d1f', '#ffb347', '#8a5a48', '#c98a9a',
  '#e3a9a0', '#a77fa6', '#7d6aa0', '#e3e5e6', '#c9cdcf', '#aeb3b7', '#939aa0', '#78808a', '#5e6670', '#454d58',
  '#2f3640', '#b4b29c', '#9c9a84', '#82826e', '#696b5a', '#525447', '#6e6258', '#56493f', '#8fa29c', '#6f8582',
  '#536a6b', '#3d5257', '#2c3d45', '#3f4535',
];

/** El uniform de la paleta: a mano y no con THREE.Color, que pasa el hex a lineal (el shader usa crudos). */
export function paletaUniform() {
  return { value: PALETA.map(h => { const n = parseInt(h.slice(1), 16); return new THREE.Vector3((n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); }) };
}

// LA PASADA FINAL DE DUSK PATROL (render/shaders/post.js): cada pixel a los dos colores mas cercanos de su
// paleta, con dither Bayer entre los dos. Es la mitad del look. La comparten el terreno y el avion
// (cada shader declara `uniform vec3 uPal[84]`).
export const PALETA_GLSL = /* glsl */`
float bayerP(vec2 p){ ivec2 q = ivec2(mod(floor(p), 4.0)); int i = q.x + q.y*4;
  const float M[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return (M[i]+0.5)/16.0; }
vec3 paleta(vec3 col){
  col = clamp(col, 0.0, 1.0);
  float d1 = 1e9, d2 = 1e9; vec3 p1 = vec3(0.0), p2 = vec3(0.0);
  for (int i=0;i<84;i++){ vec3 dv = col - uPal[i]; float dd = dot(dv*dv, vec3(1.0,1.25,0.8));
    if (dd < d1) { d2 = d1; p2 = p1; d1 = dd; p1 = uPal[i]; } else if (dd < d2) { d2 = dd; p2 = uPal[i]; } }
  vec3 e = p2 - p1; float tq = clamp(dot(col - p1, e)/max(dot(e,e), 1e-6), 0.0, 1.0);
  return bayerP(gl_FragCoord.xy) < tq ? p2 : p1;
}`;

const VS = /* glsl */`
in vec3 position;
void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FS = /* glsl */`
precision highp float;
uniform sampler2D uHeight; uniform sampler2D uBiome; uniform sampler2D uCloud; uniform sampler2D uDetail;
uniform vec2 uMap; uniform vec2 uOrg;
uniform vec3 uCam; uniform vec3 uCR; uniform vec3 uCU; uniform vec3 uCF;
uniform vec2 uTan; uniform vec2 uRes; uniform vec2 uNF; uniform vec2 uPP; uniform float uFoc;
uniform float uTime; uniform float uTile; uniform float uHMax;
uniform vec3 uSun; uniform vec3 uJSd;
uniform vec3 uJP; uniform vec3 uJR; uniform vec3 uJU; uniform vec3 uJF; uniform float uJS;
uniform vec3 uPal[84];
${PALETA_GLSL}
out vec4 oCol;
#define CB 700.0
#define CT 860.0
#define ROOF 1500.0
float bayer(vec2 p){ ivec2 q = ivec2(mod(floor(p), 4.0)); int i = q.x + q.y*4;
  const float M[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return (M[i]+0.5)/16.0; }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*0.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash12(i), b=hash12(i+vec2(1,0)), c=hash12(i+vec2(0,1)), d=hash12(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float stepq(float v, float n, float b){ float f = clamp(v,0.0,1.0)*n; float i = floor(f); float fr = f - i;
  return min(i + step(b, smoothstep(0.32, 0.68, fr)), n)/n; }
const vec3 SUNT = vec3(0.98, 0.98, 0.95);   // overcast: light is diffuse, cool and nearly white
const vec3 SHDT = vec3(0.50, 0.53, 0.60);

${mundo.DET_AMP_GLSL}
vec2 muv(vec2 xz){ return (xz + uOrg)/uMap; }
float hgt(vec2 xz){ float c = textureLod(uHeight, muv(xz), 0.0).r; return c + detAmp(c)*textureLod(uDetail, xz/uTile, 0.0).r; }
float cov(vec2 xz){ vec4 c = textureLod(uCloud, xz/uTile, 0.0); return clamp(c.r + (c.g-0.5)*0.6*c.r, 0.0, 1.0); }
float ctopAt(vec2 xz, float c){ float bl = vnoise(xz/90.0)*0.6 + vnoise(xz/30.0)*0.4; return CB + 8.0 + 70.0*pow(c, 0.8) + (bl-0.45)*40.0*sqrt(c); }
float cbot(float c){ return CB + 34.0*(1.0-c)*(1.0-c); }
bool inCloud(vec3 q){ float c = cov(q.xz); return c > 0.03 && q.y < ctopAt(q.xz, c) && q.y > cbot(c); }

vec3 hazeCol(vec3 rd){
  vec2 h = rd.xz; float hl = length(h);
  float a = hl > 1e-4 ? dot(h/hl, normalize(uSun.xz))*0.5+0.5 : 0.5;
  vec3 c = mix(vec3(0.58,0.61,0.66), vec3(0.70,0.70,0.68), smoothstep(0.4, 1.0, a));
  // a thin pale break under the overcast, low on the horizon toward the hidden sun
  float band = (1.0 - smoothstep(0.0, 0.045, abs(rd.y - 0.012))) * smoothstep(0.82, 1.0, a);
  return mix(c, vec3(0.86,0.83,0.72), band*0.55);
}
/** Sky = the underside of a solid overcast deck at ROOF, mottled, fading into the haze. */
vec3 skyBase(vec3 rd){
  vec3 hz = hazeCol(rd);
  if (rd.y <= 0.0) return hz;
  float t = (ROOF - min(uCam.y, ROOF - 50.0))/max(rd.y, 1e-3);
  vec2 q = uCam.xz + rd.xz*t + vec2(uTime*6.0, uTime*2.0);
  float n = vnoise(q/1100.0)*0.55 + vnoise(q/330.0)*0.3 + vnoise(q/90.0)*0.15;
  vec2 h = rd.xz; float hl = max(length(h), 1e-4);
  float a = dot(h/hl, normalize(uSun.xz))*0.5+0.5;
  vec3 deck = mix(vec3(0.36,0.38,0.44), vec3(0.60,0.62,0.66), smoothstep(0.25, 0.75, n));
  deck = mix(deck, vec3(0.74,0.74,0.72), smoothstep(0.6, 0.85, n)*smoothstep(0.6, 1.0, a)*0.6);
  return mix(deck, hz, clamp(1.0 - exp(-t*0.00011), 0.0, 1.0));
}
vec3 sky(vec3 rd, float b){ return skyBase(rd); }
float jetSh(vec3 p){
  if (uJS < 0.5) return 1.0;
  float dn = dot(uJSd, uJU);
  if (abs(dn) < 0.06) return 1.0;
  float s = dot(uJP - p, uJU)/dn;
  if (s < 0.0 || s > 5000.0) return 1.0;
  vec3 q = p + uJSd*s - uJP;
  float x = abs(dot(q, uJR)), z = dot(q, uJF);
  // la planta de un A-4 a escala (~12 m de largo, 8,4 de envergadura): el avion de RASANTE
  bool body = z > -6.0 && z < 6.2 && x < min(0.9, (6.2 - z)*0.3);
  bool wing = z > -3.2 && z < 1.6 && x < min(0.9 + (1.6 - z)*0.75, 4.2);
  bool tail = z > -6.0 && z < -4.2 && x < min(0.8 + (-4.2 - z)*1.2, 2.2);
  float k = (body || wing || tail) ? 1.0 : 0.0;
  return 1.0 - k*mix(0.45, 0.2, smoothstep(600.0, 3000.0, s));   // soft: overcast light
}
float cloudSh(vec3 p){
  float s = (CB + 70.0 - p.y)/uSun.y;
  float c = cov(p.xz + uSun.xz*s);
  return 1.0 - smoothstep(0.05, 0.3, c)*0.35;
}
vec3 shadeCloud(vec3 q, float c, float b){
  float e = 9.0;
  vec2 ex = vec2(e,0.0), ez = vec2(0.0,e);
  float tx = ctopAt(q.xz+ex, cov(q.xz+ex)) - ctopAt(q.xz-ex, cov(q.xz-ex));
  float tz = ctopAt(q.xz+ez, cov(q.xz+ez)) - ctopAt(q.xz-ez, cov(q.xz-ez));
  vec3 n = normalize(vec3(-tx/(2.0*e), 1.0, -tz/(2.0*e)));
  float top = ctopAt(q.xz, c);
  float hf = clamp((q.y - CB)/(top - CB + 1.0), 0.0, 1.0);
  if (q.y < cbot(c) + 5.0) n = normalize(vec3(n.x*0.5, -1.0, n.z*0.5));
  float k = 0.2 + max(n.y, 0.0)*0.35 + dot(n, uSun)*0.25 + hf*0.35;
  if (inCloud(q + uSun*22.0) || inCloud(q + uSun*70.0)) k *= 0.55;
  k *= mix(0.3, 1.0, jetSh(q));
  float qk = stepq(k, 4.0, b);
  vec3 col = qk < 0.125 ? vec3(0.40,0.42,0.48) : qk < 0.375 ? vec3(0.53,0.55,0.60) : qk < 0.625 ? vec3(0.65,0.67,0.71) : qk < 0.875 ? vec3(0.76,0.78,0.80) : vec3(0.86,0.87,0.88);
  return col;
}
vec3 shadeLand(vec3 p, float t, float b){
  vec2 uv = muv(p.xz);
  vec4 hs = textureLod(uHeight, uv, 0.0);
  vec4 dd = textureLod(uDetail, p.xz/uTile, 0.0);
  float a = detAmp(hs.r);
  float h = hs.r + a*dd.r;
  vec3 cn = vec3(hs.g, sqrt(max(1.0 - hs.g*hs.g - hs.b*hs.b, 1e-4)), hs.b);
  vec2 g = -cn.xz/cn.y + a*dd.gb;
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec4 bio = textureLod(uBiome, uv, 0.0);
  float slope = 1.0 - n.y;
  float nz = vnoise(p.xz*0.013), nz2 = vnoise(p.xz*0.09);
  // winter white grass: dull straw and grey-olive
  vec3 alb = mix(vec3(0.70,0.68,0.55), vec3(0.58,0.59,0.50), smoothstep(0.3, 0.7, bio.g + (nz2-0.5)*0.35));
  alb = mix(alb, vec3(0.64,0.60,0.50), smoothstep(0.55, 0.85, bio.a + (nz-0.5)*0.3)*0.6);
  // diddle-dee heath and wet peat: dark brown
  float heath = smoothstep(0.55, 0.7, bio.r + (nz2-0.5)*0.3);
  alb = mix(alb, mix(vec3(0.42,0.36,0.32), vec3(0.34,0.28,0.28), smoothstep(0.4, 0.7, nz)), heath*0.8);
  // grey sand and shingle
  float sand = (1.0 - smoothstep(0.6, 2.0 + nz*2.5, h)) * (1.0 - smoothstep(0.15, 0.3, slope));
  alb = mix(alb, vec3(0.74,0.73,0.68), sand);
  // stone runs
  float run = smoothstep(0.62, 0.74, bio.b*0.7 + vnoise(p.xz/90.0)*0.5 + (nz2-0.5)*0.2);
  float speck = step(0.5, hash12(floor(p.xz/3.0)));
  alb = mix(alb, mix(vec3(0.72,0.72,0.72), vec3(0.55,0.56,0.58), speck), run);
  // rock
  float rock = smoothstep(0.30, 0.42, slope + (nz-0.5)*0.12);
  rock = max(rock, smoothstep(540.0, 650.0, h + (nz-0.5)*60.0)*0.8);
  alb = mix(alb, mix(vec3(0.54,0.55,0.58), vec3(0.40,0.41,0.46), nz2), rock);
  // winter snow on the high ground, patchy lower down in the lee of slopes
  float snow = smoothstep(390.0, 470.0, h + (nz-0.5)*120.0 + (nz2-0.5)*40.0) * (1.0 - smoothstep(0.42, 0.6, slope));
  snow = max(snow, smoothstep(0.72, 0.8, vnoise(p.xz/160.0) + (nz-0.5)*0.2) * smoothstep(250.0, 360.0, h) * (1.0 - smoothstep(0.2, 0.35, slope)));
  alb = mix(alb, vec3(0.88,0.89,0.91), snow);
  // overcast light: mostly from the sky dome, a weak directional part, soft baked shadows
  float dif = clamp(dot(n, uSun)*1.3 + 0.4, 0.0, 1.0);
  float L = (0.5*dif + 0.5*n.y) * mix(0.6, 1.0, hs.a) * cloudSh(p) * jetSh(p);
  float ter = fract(h/18.0);
  L *= 1.0 - 0.14*smoothstep(0.02, 0.1, slope)*step(0.82, ter);
  L = stepq(L, 4.0, b);
  return mix(alb*SHDT, alb*SUNT, L);
}
// LAS OLAS (autor, 19/11: "no hay olas, el agua parece un piso"): una superficie de verdad, no el plano
// y = 0 con dibujo encima. Tres trenes cruzados que vienen del oeste y un poco de ruido; se achican en el
// bajo (la costa no rompe a un metro de altura). Alrededor de un metro: el oleaje del pasillo.
float olaAmp(vec2 q){ return smoothstep(0.5, 8.0, max(-hgt(q), 0.0)); }
float ola(vec2 q){
  float tt = uTime;
  float h = 0.55*sin(q.x*0.060 + q.y*0.018 - tt*1.40) + 0.35*sin(q.x*0.110 - q.y*0.070 - tt*2.10 + 1.3)
          + 0.22*sin(q.x*0.023 + q.y*0.051 - tt*0.85) + (vnoise(q*0.12 - vec2(tt*0.5, 0.0)) - 0.5)*0.45;
  return h;
}
vec3 olaNormal(vec2 q, float a){
  float e = 0.8;
  float hx = ola(q + vec2(e, 0.0)) - ola(q - vec2(e, 0.0)), hz = ola(q + vec2(0.0, e)) - ola(q - vec2(0.0, e));
  return normalize(vec3(-hx*a/(2.0*e), 1.0, -hz*a/(2.0*e)));
}
vec3 shadeWater(vec3 p, vec3 rd, float t, float b){
  vec4 hs = textureLod(uHeight, muv(p.xz), 0.0);
  float dep = max(-hgt(p.xz), 0.0);
  // cold South Atlantic: grey-green shallows to dark slate
  vec3 wc = vec3(0.52,0.62,0.58);
  wc = mix(wc, vec3(0.42,0.53,0.51), smoothstep(0.8, 2.5, dep));
  wc = mix(wc, vec3(0.33,0.45,0.45), smoothstep(3.0, 8.0, dep));
  wc = mix(wc, vec3(0.26,0.37,0.39), smoothstep(10.0, 25.0, dep));
  wc = mix(wc, vec3(0.20,0.29,0.33), smoothstep(30.0, 70.0, dep));
  wc = mix(wc, vec3(0.16,0.23,0.28), smoothstep(80.0, 130.0, dep));
  // kelp beds in the shallows around the coast
  float kelp = (smoothstep(1.5, 4.0, dep) - smoothstep(14.0, 24.0, dep)) * smoothstep(0.62, 0.7, vnoise(p.xz/45.0) + (vnoise(p.xz/8.0)-0.5)*0.3);
  wc = mix(wc, vec3(0.24,0.27,0.20), kelp*0.85);
  float sh = mix(0.6, 1.0, hs.a) * cloudSh(p) * jetSh(p);
  wc *= mix(0.78, 1.0, sh);
  // wind-driven swell from the west
  vec2 q = p.xz; float tt = uTime;
  float w1 = sin(q.x*0.045 + q.y*0.012 - tt*1.6), w2 = sin(q.x*0.11 - q.y*0.05 - tt*2.3 + 1.3);
  float oa = olaAmp(q), oh = ola(q)*oa;
  vec3 n = normalize(olaNormal(q, oa) + vec3((vnoise(q*0.08 - vec2(tt*0.6, 0.0))-0.5)*0.12, 0.0, (vnoise(q*0.08 + 3.7)-0.5)*0.12));
  // la luz de la ola: el seno oscuro, la cara que mira al cielo clara (como el mar del pasillo: valle, cuerpo, cresta)
  wc *= mix(0.80, 1.18, smoothstep(-0.9, 0.9, oh)) * (0.88 + 0.12*n.y);
  vec3 rf = reflect(rd, n);
  rf.y = abs(rf.y);
  float cosT = clamp(-rd.y, 0.0, 1.0);
  float fr = 0.02 + 0.98*pow(1.0 - cosT, 5.0);
  wc = mix(wc, skyBase(rf), clamp(fr*1.1, 0.0, 0.8));
  // whitecaps: streaks along the wind, on open water, breaking and fading
  vec2 cq = vec2((q.x - tt*7.0)/16.0, q.y/5.0);
  vec2 ci = floor(cq), cf = fract(cq) - 0.5;
  float life = fract(tt*0.3 + hash12(ci)*7.0);
  float cap = step(0.965, hash12(ci + 3.1)) * step(life, 0.5) * smoothstep(4.0, 12.0, dep)
            * step(length(cf*vec2(1.0, 2.2)), 0.45) * (1.0 - smoothstep(600.0, 1800.0, t));
  if (cap*(1.0 - life*1.4) > b*0.8) wc = mix(wc, vec3(0.86,0.88,0.88), 0.85);
  // surf along the shore
  float nzf = vnoise(q*0.15);
  float band = sin(dep*2.4 - tt*2.0 + nzf*4.0);
  float foam = dep < 0.6 + nzf*0.8 ? 1.0 : ((dep < 5.0 && band > 0.7) ? 0.8 : 0.0);
  if (foam > b*0.9) wc = mix(wc, vec3(0.90,0.91,0.90)*mix(0.8, 1.0, sh), 0.9);
  // LA ESPUMA EN PUNTOS sobre las crestas, fija al MAPA (la alfombra de puntos del pasillo): de cerca pasa
  // rapido bajo el avion y es lo que cuenta la velocidad. Solo cerca: lejos seria ruido. El radio crece con la
  // distancia: la mota mide ~1 pixel en pantalla (si no, al lado de la camara son manchas blancas enormes).
  // LA ALFOMBRA DEL PASILLO (render/world.js drawSeaDots): un punto por metro (SPZ 1, SPX 0.93), prendido por
  // la ola; asi el agua pasa a la misma velocidad aparente que en el pasillo.
  vec2 gq = q/vec2(0.93, 1.0), gi = floor(gq), gf = fract(gq) - 0.5;
  // (puntos de UN pixel y tenues, como los del pasillo: un brillo, no nieve)
  float pz = step(0.80 - 0.15*smoothstep(0.0, 0.9, oh), hash12(gi)) * step(length(gf), clamp(t*0.0036, 0.012, 0.3))
           * (1.0 - smoothstep(60.0, 190.0, t));
  if (pz > 0.5) wc = mix(wc, vec3(0.78,0.84,0.84), 0.45);
  return wc;
}
float depthFor(float t, vec3 rd){
  float zf = max(t*dot(rd, uCF), 1e-3); float n = uNF.x, f = uNF.y;
  float ndc = ((f+n)/(n-f)*(-zf) + 2.0*f*n/(n-f))/zf;
  return clamp(ndc*0.5+0.5, 0.0, 1.0);
}
void main(){
  vec2 fc = gl_FragCoord.xy;
  float b = bayer(fc);
  // el rayo por pixel con PUNTO PRINCIPAL y FOCAL explicitos: la camara del pasillo tiene el horizonte en la
  // fila 96 (no en el centro) y el lienzo con margen para el giro del mundo
  vec3 rd = normalize(uCF + ((fc.x - uPP.x)/uFoc)*uCR + ((fc.y - uPP.y)/uFoc)*uCU);
  vec3 ro = uCam;
  const float FARD = 14000.0;   // overcast: short visibility
  float tW = rd.y < -1e-5 ? ro.y/(-rd.y) : 1e9;
  float tMax = min(FARD, tW);
  float t = 0.0;
  bool hitL = false;
  if (ro.y > uHMax) t = rd.y < -1e-5 ? (ro.y - uHMax)/(-rd.y) : 1e9;
  if (t < tMax) {
    float tp = t;
    for (int i=0;i<170;i++){
      vec3 p = ro + rd*t;
      float d = p.y - hgt(p.xz);
      if (d < 0.0) { hitL = true; break; }
      if (p.y > uHMax && rd.y > 0.0) break;
      tp = t;
      t += max(d*0.42, 0.35 + t*0.0016);
      if (t > tMax) break;
    }
    if (hitL) { float a = tp, c = t; for (int k=0;k<6;k++){ float m = 0.5*(a+c); vec3 p = ro+rd*m; if (p.y - hgt(p.xz) < 0.0) c = m; else a = m; } t = c; }
  }
  bool water = false;
  if (!hitL) { if (tW < FARD) { water = true; t = tW; } else t = 1e9; }
  float tS = (hitL || water) ? t : FARD;
  float tc = 1e9; vec3 cp = vec3(0.0); float ccov = 0.0;
  float ta, tb;
  if (abs(rd.y) < 1e-5) { ta = (ro.y > CB && ro.y < CT) ? 0.0 : 1e9; tb = tS; }
  else { float t1 = (CB-ro.y)/rd.y, t2 = (CT-ro.y)/rd.y; ta = max(min(t1,t2), 0.0); tb = min(max(t1,t2), tS); }
  tb = min(tb, 13000.0);
  if (ta < tb) {
    float s = ta + b*10.0, sp = ta;
    for (int i=0;i<64;i++){
      if (inCloud(ro + rd*s)) {
        float a = sp, e = s;
        for (int k=0;k<5;k++){ float m = 0.5*(a+e); if (inCloud(ro+rd*m)) e = m; else a = m; }
        tc = e; cp = ro + rd*e; ccov = cov(cp.xz); break;
      }
      sp = s; s += max(16.0, s*0.018);
      if (s > tb) break;
    }
    if (tc < 1e8) {
      if (ccov < 0.10 && (ccov - 0.03)/0.07 < b) tc = 1e9;
      else if (tc < 90.0 && tc/90.0 < b) tc = 1e9;
    }
  }
  vec3 col; float tHit = 1e9; vec3 hp = ro;
  if (tc < 1e8) { hp = cp; col = shadeCloud(cp, ccov, b); tHit = tc; }
  else if (hitL) { hp = ro + rd*t; col = shadeLand(hp, t, b); tHit = t; }
  else if (water) {
    // del plano a la OLA: unas vueltas de punto fijo (la ola es suave y el rayo baja de frente)
    for (int k = 0; k < 4; k++) { vec3 q = ro + rd*t; float hy = ola(q.xz)*olaAmp(q.xz); t = (ro.y - hy)/max(-rd.y, 1e-4); }
    hp = ro + rd*t; col = shadeWater(hp, rd, t, b); tHit = t;
  }
  else col = sky(rd, b);
  if (tHit < 1e8) {
    float avgY = max(0.5*(ro.y + hp.y), 0.0);
    float fd = 1.0 - exp(-tHit*0.00032*exp(-avgY/2200.0));
    fd = max(fd, smoothstep(8000.0, FARD, tHit));
    col = mix(col, hazeCol(rd), fd);
    gl_FragDepth = depthFor(tHit, rd);
  } else gl_FragDepth = 1.0;
  oCol = vec4(paleta(col), 1.0);
}`;

const T = { malla: null, mat: null };

function dataTex(data, w, h, type, wrap) {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, type);
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = wrap; t.generateMipmaps = false; t.flipY = false;
  t.needsUpdate = true;
  return t;
}
function aMedia(f32) {
  const u = new Uint16Array(f32.length);
  for (let i = 0; i < f32.length; i++) u[i] = THREE.DataUtils.toHalfFloat(f32[i]);
  return u;
}
const vec = () => new THREE.Vector3();

/** Arma la malla de pantalla completa la primera vez que el mundo esta listo. null si todavia no. */
export function crear(escena) {
  if (T.malla) return T.malla;
  if (!THREE || !mundo.listo()) return null;
  const X = mundo.texturas();
  const U = {
    uHeight: { value: dataTex(aMedia(X.HD), mundo.MAP_NX, mundo.MAP_NZ, THREE.HalfFloatType, THREE.ClampToEdgeWrapping) },
    uBiome: { value: dataTex(X.BIO, mundo.MAP_NX, mundo.MAP_NZ, THREE.UnsignedByteType, THREE.ClampToEdgeWrapping) },
    uDetail: { value: dataTex(aMedia(X.DD), mundo.N, mundo.N, THREE.HalfFloatType, THREE.RepeatWrapping) },
    uCloud: { value: dataTex(X.CL, mundo.CN, mundo.CN, THREE.UnsignedByteType, THREE.RepeatWrapping) },
    uMap: { value: new THREE.Vector2(mundo.MAP_W, mundo.MAP_D) }, uOrg: { value: new THREE.Vector2() },
    uCam: { value: vec() }, uCR: { value: vec() }, uCU: { value: vec() }, uCF: { value: vec() },
    uTan: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2() }, uNF: { value: new THREE.Vector2() },
    uPP: { value: new THREE.Vector2() }, uFoc: { value: 1 },
    uTime: { value: 0 }, uTile: { value: mundo.TILE }, uHMax: { value: mundo.hmax() },
    uSun: { value: new THREE.Vector3(...mundo.SUN) },
    uJSd: { value: new THREE.Vector3(mundo.SUN[0] * 0.5, 1, mundo.SUN[2] * 0.5).normalize() },
    uJP: { value: vec() }, uJR: { value: vec() }, uJU: { value: vec() }, uJF: { value: vec() },
    // la SILUETA FIJA de Dusk Patrol (`jetSh`) queda apagada: la sombra la pone avion3d.js con la malla real
    uJS: { value: 0 },
  };
  U.uPal = paletaUniform();
  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS, fragmentShader: FS, uniforms: U,
    depthTest: true, depthWrite: true, depthFunc: THREE.AlwaysDepth, fog: false,
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const m = new THREE.Mesh(g, mat);
  m.frustumCulled = false; m.renderOrder = -100;
  escena.add(m);
  T.malla = m; T.mat = mat;
  return m;
}

/** Un frame: copia la camara de three al shader. Llamar DESPUES de ubicar la camara y antes del render. */
export function frame(cam, w, A, res) {
  if (!T.malla) return;
  const U = T.mat.uniforms, e = cam.matrixWorld.elements, o = mundo.org();
  U.uOrg.value.set(o[0], o[1]);
  U.uCam.value.setFromMatrixPosition(cam.matrixWorld);
  U.uCR.value.set(e[0], e[1], e[2]).normalize();
  U.uCU.value.set(e[4], e[5], e[6]).normalize();
  U.uCF.value.set(-e[8], -e[9], -e[10]).normalize();
  const tanY = Math.tan(cam.fov * Math.PI / 360);
  U.uTan.value.set(tanY * cam.aspect, tanY);
  U.uRes.value.set(res.x, res.y);
  // punto principal y focal: los de la camara del pasillo si los trae (camara.js `proyeccionPasillo`); si no,
  // los de una camara simetrica
  if (cam.userData.pp) { U.uPP.value.set(cam.userData.pp[0], cam.userData.pp[1]); U.uFoc.value = cam.userData.foc; }
  else { U.uPP.value.set(res.x / 2, res.y / 2); U.uFoc.value = (res.y / 2) / tanY; }
  U.uNF.value.set(cam.near, cam.far);
  U.uTime.value = w.t || 0;
  // la sombra del avion: su posicion y su base (derecha, arriba, adelante) con el alabeo
  const f = A.fwd, cy = Math.cos(A.yaw), sy = Math.sin(A.yaw);
  const r0 = { x: cy, y: 0, z: sy };                                   // derecha sin alabeo
  const u0 = { x: r0.y * f.z - r0.z * f.y, y: r0.z * f.x - r0.x * f.z, z: r0.x * f.y - r0.y * f.x };   // r × f
  const cr = Math.cos(A.roll || 0), sr = Math.sin(A.roll || 0);
  U.uJP.value.set(A.pos.x, A.pos.y, A.pos.z);
  U.uJF.value.set(f.x, f.y, f.z);
  U.uJR.value.set(r0.x * cr - u0.x * sr, r0.y * cr - u0.y * sr, r0.z * cr - u0.z * sr);
  U.uJU.value.set(u0.x * cr + r0.x * sr, u0.y * cr + r0.y * sr, u0.z * cr + r0.z * sr);
}

export function ver(on) { if (T.malla) T.malla.visible = on; }

/** El SUELO para otros shaders (la sombra del avion, avion3d.js): los mismos uniforms del terreno —el mapa,
 *  el relieve fino, el origen—, compartidos por referencia, y el GLSL de la altura (`hgt`), el mismo que
 *  marcha el terreno. null hasta que el terreno exista. */
export function suelo() {
  if (!T.mat) return null;
  const U = T.mat.uniforms;
  return { uniforms: { uHeight: U.uHeight, uDetail: U.uDetail, uMap: U.uMap, uOrg: U.uOrg, uTile: U.uTile },
    glsl: `uniform sampler2D uHeight; uniform sampler2D uDetail; uniform vec2 uMap; uniform vec2 uOrg; uniform float uTile;
${mundo.DET_AMP_GLSL}
float hgt(vec2 xz){ float c = textureLod(uHeight, (xz + uOrg)/uMap, 0.0).r; return c + detAmp(c)*textureLod(uDetail, xz/uTile, 0.0).r; }` };
}
