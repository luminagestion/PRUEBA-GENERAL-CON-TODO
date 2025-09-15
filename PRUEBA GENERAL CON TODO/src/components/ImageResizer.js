
export async function resizeImageToDataURL(file, maxSize=1500){
  const img = document.createElement('img')
  const url = URL.createObjectURL(file)
  await new Promise(res=>{ img.onload=()=>res(); img.src=url })
  const canvas = document.createElement('canvas')
  let { width, height } = img
  if(width>height){
    if(width>maxSize){ height = Math.round(height * (maxSize/width)); width = maxSize }
  }else{
    if(height>maxSize){ width = Math.round(width * (maxSize/height)); height = maxSize }
  }
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  URL.revokeObjectURL(url)
  return dataUrl
}
