import sharp from 'sharp';
import path from 'node:path';
const root = path.join(process.cwd(), 'public/art');
async function cut(source, name, region, transparent = false, gray = false) {
  const image = sharp(path.join(root, source)).extract(region).ensureAlpha();
  if (!transparent) { await image.webp({ quality: 92 }).toFile(path.join(root, `${name}.webp`)); return; }
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const seen = new Uint8Array(w * h), queue = [];
  const test = (i) => {
    const r=data[i*4], g=data[i*4+1], b=data[i*4+2];
    return gray ? (r>62 && r<170 && Math.max(r,g,b)-Math.min(r,g,b)<22) : (r>225 && g>222 && b>215 && Math.max(r,g,b)-Math.min(r,g,b)<24);
  };
  const add = (i) => { if(i>=0 && i<w*h && !seen[i] && test(i)) { seen[i]=1; queue.push(i); } };
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
  for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  for(let j=0;j<queue.length;j++){const i=queue[j];data[i*4+3]=0;if(i%w>0)add(i-1);if(i%w<w-1)add(i+1);add(i-w);add(i+w);}
  await sharp(data,{raw:info}).webp({quality:95}).toFile(path.join(root,`${name}.webp`));
}
await Promise.all([
 cut('home-source.png','reading',{left:95,top:345,width:700,height:612},true),
 cut('teach-source.png','listening',{left:74,top:1050,width:731,height:710},true),
 cut('onboarding-source.png','chapter-learn',{left:60,top:123,width:432,height:416}),
 cut('onboarding-source.png','chapter-teach',{left:398,top:596,width:426,height:414}),
 cut('onboarding-source.png','chapter-write',{left:52,top:1081,width:432,height:414}),
 cut('characters.png','running',{left:35,top:788,width:215,height:202},true,true),
 cut('characters.png','happy',{left:220,top:523,width:170,height:169},true,true),
 cut('characters.png','surprised',{left:393,top:518,width:171,height:174},true,true),
 cut('characters.png','sleeping',{left:718,top:530,width:167,height:162},true,true),
 cut('characters.png','curious',{left:886,top:522,width:192,height:170},true,true),
]);
console.log('Prepared mascot and chapter assets.');
