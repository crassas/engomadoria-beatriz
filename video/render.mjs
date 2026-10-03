import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition} from '@remotion/renderer';
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const serveUrl=await bundle({entryPoint:path.resolve('video/index.jsx'),publicDir:path.resolve('docs'),outDir:path.resolve('render-cache/bundle')});
const composition=await selectComposition({serveUrl,id:'BeatrizCare',browserExecutable});
let last=-1;
await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.resolve('docs/assets/beatriz-care.mp4'),crf:24,pixelFormat:'yuv420p',concurrency:2,browserExecutable,onProgress:({progress})=>{const value=Math.floor(progress*10);if(value!==last){last=value;console.log(`Rendering ${value*10}%`)}}});
console.log('Remotion video saved: docs/assets/beatriz-care.mp4');
