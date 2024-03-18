"use strict"

import Alpine from 'alpinejs';
window.Alpine = Alpine;
Alpine.start();

function CalculateVh()
{
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}

window.addEventListener('DOMContentLoaded', CalculateVh);
window.addEventListener('resize', CalculateVh);
window.addEventListener('orientationchange', CalculateVh);

class Fragment
{
  frag = undefined;
  row = 0;
  column = 0;
  index = 0;
}

const jumbleDiv = document.getElementById("jumbleDiv");
const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");

const completed = document.getElementById('completed');
const originalB = document.getElementById('originalImg');

const rowInput = document.getElementById("rows");
const colInput = document.getElementById("columns");

const fileInput = document.getElementById("myfile");
const uploadSelect = document.getElementById('uploadedFiles');
uploadSelect.onchange = function() { ReLoad(); };

const triggerSelectFileButton = document.getElementById("triggerSelectFileButton");
const fileupload = document.getElementById("fileupload");
fileupload.onchange = function() { LoadFiles(); };
const clearFileSelectButton = document.getElementById("clearFileSelectButton");

triggerSelectFileButton.onclick = function() { fileupload.click(); };

const originalButton = document.getElementById("originalButton");
originalButton.onclick = function() { ToggleOriginal(); };

const jumbleButton = document.getElementById("jumbleButton");
jumbleButton.onclick = function() { Jumble(); };

const settingsButton = document.getElementById("settingsButton");
settingsButton.onclick = function() { ToggleSettings(); };

const loadSelected = document.getElementById("loadSelected");
loadSelected.onclick = function() { ReLoad();ToggleSettings(); };

const settingsMenu = document.getElementById("settingsMenu");
settingsMenu.style.display = 'none';

let w, h, tW, tH, total, firstP, secondP;
let scale = 1;

let original = [];
let fragments = [];
let uploadedFiles = [];

let img1 = new Image();

let toggleS = false;

function ToggleSettings()
{
  toggleS = !toggleS;
  if(toggleS)
  {
    settingsMenu.style.display = '';
  } 
  else
  {
    settingsMenu.style.display = 'none';
  }
}

function LoadFiles() 
{
  let files = fileupload.files;

  function readAndPreview(file)
  {
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
      let reader = new FileReader();
  
      reader.addEventListener("load", function ()
      {
        let listImg = document.createElement("img");
        listImg.src = this.result;
        uploadedFiles.push(listImg);
        let newSelect = document.createElement('option');
        newSelect.value = uploadedFiles.length - 1;
        newSelect.innerHTML = file.name;
        uploadSelect.appendChild(newSelect);
      }, 
      false);

      reader.readAsDataURL(file);
    }
  }

  if (files.length > 0)
  {
    for(let f = 0; f < files.length; f++)
    {
      readAndPreview(files[f]);
    }
  }
}

function SwitchImage()
{
  if(uploadedFiles.Length == 0)
  {
    return;
  }

  if(imgSource == null || imgSource == '')
  {
    return;
  }

  img1.src = uploadedFiles[uploadSelect.value].src;
  ctx.drawImage(img1, 0, 0);
  fragments.length = 0;
  original.length = 0;
  CreateImage(img1.src);
}

function ReLoad()
{
  if(uploadedFiles.Length == 0)
  {
    return;
  }

  img1.src = uploadedFiles[uploadSelect.value].src;
  originalB.dataset.state = "jumbled";
  ctx.drawImage(img1, 0, 0);
  CreateImage(img1.src);
}

function ChangeScale()
{
  scale = document.getElementById('scale').value;
}

function CreateImage(imgSource)
{
  let img = document.createElement('img');
  
  if(uploadedFiles.Length == 0)
  {
    return;
  }

  if(imgSource == null || imgSource == '')
  {
    return;
  }
  
  img.src = imgSource;

  canvas.width = img.width;
  canvas.height = img.height;

  let maxWidth = jumbleDiv.offsetWidth * 0.75;
  let maxHeight = jumbleDiv.offsetHeight * 0.75;

  let originalWidth = img.width;
  let originalHeight = img.height;

  if(originalWidth > maxWidth)
  {
    let percent = ( 100 / canvas.width ) * maxWidth;
    let newHeight = ( canvas.height / 100 ) * percent;

    img.width = maxWidth;
    img.height = newHeight;
    canvas.width = maxWidth;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, maxWidth, newHeight);
  }
  else if(originalHeight > maxHeight)
  {
    let percent = ( 100 / canvas.height ) * maxHeight;
    let newWidth = ( canvas.width / 100 ) * percent;

    img.width = newWidth;
    img.height = maxHeight;
    canvas.width = newWidth;
    canvas.height = maxHeight;
    ctx.drawImage(img, 0, 0, newWidth, maxHeight);
  }
  else
  {
    ctx.drawImage(img, 0, 0, img.width, img.height);
  }

  tW = img.width / rowInput.value;
  tH = img.height / colInput.value;
  total = rowInput.value * colInput.value;

  fragments.length = 0;
  original.length = 0;

  if(canvas.width === 0) return;

  for(let i = 0; i < rowInput.value; i++)
  {
    for(let p = 0; p < colInput.value; p++)
    {
      let imgData = ctx.getImageData(i * tW, p * tH, tW, tH);
      let f = new Fragment();
      f.index = fragments.length;
      f.row = i;
      f.column = p;
      f.frag = imgData;
      fragments.push(f);
      let f1 = new Fragment();
      f1.index = fragments.length;
      f1.row = i;
      f1.column = p;
      f1.frag = imgData;
      original.push(f1);
    }
  }
  originalB.state = "jumbled";
}

function Jumble()
{
  if(uploadedFiles.Length == 0)
  {
    return;
  }

  if(fragments.length == 0)
  {
    return;
  }
  let temp = [];
  let tempImg = [];
  for(let i = 0; i < total; i++)
  {
    temp.push(i);
  }
  for(let i = 0; i < rowInput.value; i++)
  {
    for(let p = 0; p < colInput.value; p++)
    {
      let rndImg = Math.floor(Math.random() * temp.length);
      tempImg.push(fragments[temp[rndImg]].frag);
      temp.splice(rndImg, 1);
    }
  }
  for(let i = 0; i < tempImg.length; i++)
  {
    fragments[i].frag = tempImg[i];
    ctx.putImageData(fragments[i].frag, fragments[i].row * tW, fragments[i].column * tH);
  }
  CheckComplete();
  originalB.dataset.state = "original";
}

function ToggleOriginal()
{
  if(uploadedFiles.Length == 0)
  {
    return;
  }

  if(originalB.dataset.state === "original")
  {
    for(let i = 0; i < original.length; i++)
    {
      ctx.putImageData(original[i].frag, original[i].row * tW, original[i].column * tH);
    }
    originalB.dataset.state = "jumbled";
    originalButton.style.transform = 'rotate(90deg)';
    console.log(originalButton.style.transform);
  } 
  else if(originalB.dataset.state === 'jumbled')
  {
    for(let i = 0; i < fragments.length; i++)
    {
      ctx.putImageData(fragments[i].frag, fragments[i].row * tW, fragments[i].column * tH);
    }
    originalB.dataset.state = "original";
    originalButton.style.transform = '';
    console.log(originalButton.style.transform);
  }
}

function CheckComplete()
{
  let score = 0;
  for(let i = 0; i < fragments.length; i++)
  {
    if(fragments[i].frag === original[i].frag)
    {
      score++;
    }
  }
  let percent = Math.floor(100 /fragments.length * score);
  completed.innerHTML = percent.toString() + "%";
}

canvas.onmousedown = function(event)
{
  event.preventDefault();
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  let segX = Math.floor(x / tW);
  let segY = Math.floor(y / tH);
  firstP = segX * colInput.value + segY;
};

canvas.onmouseup = function(event)
{
  event.preventDefault();
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  let segX = Math.floor(x / tW);
  let segY = Math.floor(y / tH);
  secondP = segX * colInput.value + segY;

  if(firstP != secondP)
  {
    ctx.putImageData(fragments[secondP].frag, fragments[firstP].row * tW, fragments[firstP].column * tH);
    ctx.putImageData(fragments[firstP].frag, fragments[secondP].row * tW, fragments[secondP].column * tH);
    let f1 = fragments[firstP].frag;
    let f2 = fragments[secondP].frag;
    fragments[firstP].frag = f2;
    fragments[secondP].frag = f1;
  }
  CheckComplete();
};

canvas.ontouchstart = function(event)
{
  event.preventDefault();

  if(event.touches != undefined)
  {
    let rect = canvas.getBoundingClientRect();
    let touch = event.touches[0] || event.changedTouches[0];
    let x = touch.pageX - rect.left;
    let y = touch.pageY - rect.top;

    let segX = Math.floor(x / tW);
    let segY = Math.floor(y / tH);
    firstP = segX * colInput.value + segY;
  }
};

canvas.ontouchend = function(event)
{
  event.preventDefault();

  if(event.touches != undefined)
  {
    let rect = canvas.getBoundingClientRect();
    let touch = event.touches[0] || event.changedTouches[0];
    let x = touch.pageX - rect.left;
    let y = touch.pageY - rect.top;
  
    let segX = Math.floor(x / tW);
    let segY = Math.floor(y / tH);
    secondP = segX * colInput.value + segY;

    if(firstP != secondP)
    {
      ctx.putImageData(fragments[secondP].frag, fragments[firstP].row * tW, fragments[firstP].column * tH);
      ctx.putImageData(fragments[firstP].frag, fragments[secondP].row * tW, fragments[secondP].column * tH);
      let f1 = fragments[firstP].frag;
      let f2 = fragments[secondP].frag;
      fragments[firstP].frag = f2;
      fragments[secondP].frag = f1;
    }
    CheckComplete();
  }
};