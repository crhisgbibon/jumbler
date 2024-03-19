"use strict"

import svg from './svg.js';
import Alpine from 'alpinejs';

window.Alpine = Alpine;
Alpine.start();

const NAV = document.getElementById("NAV");
const MENU = document.getElementById("MENU");

const ORIGINAL = document.getElementById("ORIGINAL");
const COMPLETED = document.getElementById("COMPLETED");
const JUMBLE = document.getElementById("JUMBLE");

const SCALE_DOWN = document.getElementById("SCALE_DOWN");
const SCALE_UP = document.getElementById("SCALE_UP");

const UP = document.getElementById("UP");
const DOWN = document.getElementById("DOWN");

const ROWS = document.getElementById("ROWS");
const COLUMNS = document.getElementById("COLUMNS");
const THEME = document.getElementById("THEME");

const UPLOADED = document.getElementById("UPLOADED");
const PLAY = document.getElementById("PLAY");
const SELECT = document.getElementById("SELECT");
const IMPORT = document.getElementById("IMPORT");
const LOAD = document.getElementById("LOAD");

ORIGINAL.innerHTML = svg.eye.trim();
JUMBLE.innerHTML = svg.dice.trim();

UP.innerHTML = svg.up.trim();
DOWN.innerHTML = svg.down.trim();

THEME.innerHTML = svg.theme.trim();

const CANVAS = document.getElementById("CANVAS");
const c = CANVAS.getContext("2d");

ORIGINAL.onclick = function(){ window.jumbler.is_original() };
JUMBLE.onclick = function(){ window.jumbler.jumble() };

SCALE_DOWN.onclick = function(){ window.jumbler.scale_down() };
SCALE_UP.onclick = function(){ window.jumbler.scale_up() };

THEME.onclick = function(){ window.jumbler.toggle_dark() };

PLAY.onclick = function(){ window.jumbler.reload() };
SELECT.onclick = function(){ IMPORT.click() };
LOAD.onclick = function(){ window.jumbler.import() };

class Fragment
{
  constructor(
    index,
    row,
    column,
    img_data,
  )
  {
    this.index = index;
    this.row = row;
    this.column = column;
    this.frag = img_data;
  }
}

class Jumbler
{
  constructor(

    )
  {
    this.debug = false;
    this.dark = false;
    this.show_original = true;

    this.w = 0;
    this.h = 0;
    this.tW = 0;
    this.tH = 0;
    this.total = 0;
    this.firstP = 0;
    this.secondP = 0;

    this.scale = 1;
    this.original = [];
    this.fragments = [];
    this.uploaded_files = [];

    this.stored_width = 0;
    this.stored_height = 0;

    this.current_img = new Image();

    console.log(this);
  }

  toggle_dark()
  {
    this.dark = !this.dark;
    this.draw();
  }

  update_menus()
  {
    if(this.dark)
    {
      document.body.classList.remove('bg-mod_light');
      document.body.classList.add('bg-mod_dark');
      document.body.classList.remove('text-mod_dark');
      document.body.classList.add('text-mod_light');

      NAV.classList.remove('bg-mod_light');
      MENU.classList.remove('bg-mod_light');

      NAV.classList.add('bg-mod_dark');
      MENU.classList.add('bg-mod_dark');

      NAV.classList.remove('text-mod_dark');
      MENU.classList.remove('text-mod_dark');

      NAV.classList.add('text-mod_light');
      MENU.classList.add('text-mod_light');
    }
    else
    {
      document.body.classList.remove('bg-mod_dark');
      document.body.classList.add('bg-mod_light');
      document.body.classList.remove('text-mod_light');
      document.body.classList.add('text-mod_dark');

      NAV.classList.remove('bg-mod_dark');
      MENU.classList.remove('bg-mod_dark');

      NAV.classList.add('bg-mod_light');
      MENU.classList.add('bg-mod_light');

      NAV.classList.remove('text-mod_light');
      MENU.classList.remove('text-mod_light');

      NAV.classList.add('text-mod_dark');
      MENU.classList.add('text-mod_dark');
    }
  }

  import() 
  {
    let files = IMPORT.files;
    console.log(files, this.uploaded_files);

    function read_this_file(file)
    {
      if(window.File && window.FileReader && window.FileList && window.Blob)
      {
        let reader = new FileReader();
    
        reader.addEventListener("load", function ()
        {
          let list_img = document.createElement("img");
          list_img.src = this.result;
          window.jumbler.uploaded_files.push(list_img);
          let new_option = document.createElement('option');
          new_option.value = window.jumbler.uploaded_files.length - 1;
          new_option.innerHTML = file.name;
          UPLOADED.appendChild(new_option);
        }, 
        false);

        reader.readAsDataURL(file);
      }
    }

    if(files.length > 0)
    {
      for(let f = 0; f < files.length; f++)
      {
        read_this_file(files[f]);
      }
    }
  }

  reload()
  {
    if(this.uploaded_files.length == 0) return;
    this.current_img.src = this.uploaded_files[UPLOADED.value].src;
    this.stored_width = this.current_img.width;
    this.stored_height = this.current_img.height;
    this.init();
    this.dimensions();
    this.draw();
  }

  scale_up()
  {
    this.scale += 0.1;
    this.scale = parseFloat(this.scale.toFixed(2));
    this.dimensions();
    this.draw();
  }

  scale_down()
  {
    this.scale -= 0.1;
    this.scale = parseFloat(this.scale.toFixed(2));
    this.dimensions();
    this.draw();
  }

  init()
  {
    if(this.uploaded_files.length == 0) return;
    if(this.current_img == null || this.current_img == '') return;

    CANVAS.width = (this.stored_width * this.scale);
    CANVAS.height = (this.stored_height * this.scale);

    let maxWidth = CANVAS.offsetWidth * 0.75;
    let maxHeight = CANVAS.offsetHeight * 0.75;

    let originalWidth = this.stored_width;
    let originalHeight = this.stored_height;

    if(originalWidth > maxWidth)
    {
      let percent = ( 100 / CANVAS.width ) * maxWidth;
      let newHeight = ( CANVAS.height / 100 ) * percent;

      this.current_img.width = maxWidth;
      this.current_img.height = newHeight;
      CANVAS.width = maxWidth;
      CANVAS.height = newHeight;
      c.drawImage(this.current_img, 0, 0, maxWidth, newHeight);
    }
    else if(originalHeight > maxHeight)
    {
      let percent = ( 100 / CANVAS.height ) * maxHeight;
      let newWidth = ( CANVAS.width / 100 ) * percent;

      this.current_img.width = newWidth;
      this.current_img.height = maxHeight;
      CANVAS.width = newWidth;
      CANVAS.height = maxHeight;
      c.drawImage(this.current_img, 0, 0, newWidth, maxHeight);
    }
    else
    {
      CANVAS.width = this.current_img.width;
      CANVAS.height = this.current_img.height;
      c.drawImage(this.current_img, 0, 0, this.current_img.width, this.current_img.height);
    }

    this.tW = this.current_img.width / ROWS.value;
    this.tH = this.current_img.height / COLUMNS.value;

    this.total = ROWS.value * COLUMNS.value;

    this.fragments.length = 0;
    this.original.length = 0;

    for(let i = 0; i < ROWS.value; i++)
    {
      for(let p = 0; p < COLUMNS.value; p++)
      {
        let img_data = c.getImageData(i * this.tW, p * this.tH, this.tW, this.tH);

        let f = new Fragment(
          this.fragments.length,
          i,
          p,
          img_data,
        );

        this.fragments.push(f);

        let f1 = new Fragment(
          this.fragments.length,
          i,
          p,
          img_data,
        );

        this.original.push(f1);
      }
    }
  }

  dimensions()
  {
    CANVAS.width = (this.stored_width * this.scale);
    CANVAS.height = (this.stored_height * this.scale);

    let maxWidth = CANVAS.offsetWidth * 0.75;
    let maxHeight = CANVAS.offsetHeight * 0.75;

    let originalWidth = this.stored_width;
    let originalHeight = this.stored_height;

    console.log(this.current_img.width);
    console.log(this.current_img.height);

    if(originalWidth > maxWidth)
    {
      console.log('toowide');
      let percent = ( 100 / CANVAS.width ) * maxWidth;
      let newHeight = ( CANVAS.height / 100 ) * percent;

      this.current_img.width = maxWidth;
      this.current_img.height = newHeight;
      CANVAS.width = maxWidth;
      CANVAS.height = newHeight;
      c.drawImage(this.current_img, 0, 0, maxWidth, newHeight);
    }
    else if(originalHeight > maxHeight)
    {
      console.log('toohigh');
      let percent = ( 100 / CANVAS.height ) * maxHeight;
      let newWidth = ( CANVAS.width / 100 ) * percent;

      this.current_img.width = newWidth;
      this.current_img.height = maxHeight;
      CANVAS.width = newWidth;
      CANVAS.height = maxHeight;
      c.drawImage(this.current_img, 0, 0, newWidth, maxHeight);
    }
    else
    {
      console.log('justright');
      CANVAS.width = this.current_img.width;
      CANVAS.height = this.current_img.height;
      c.drawImage(this.current_img, 0, 0, this.current_img.width, this.current_img.height);
    }

    console.log(this.current_img.width);
    console.log(this.current_img.height);

    this.tW = this.current_img.width / ROWS.value;
    this.tH = this.current_img.height / COLUMNS.value;

    let counter = 0;

    for(let i = 0; i < ROWS.value; i++)
    {
      for(let p = 0; p < COLUMNS.value; p++)
      {
        let img_data = c.getImageData(i * this.tW, p * this.tH, this.tW, this.tH);
        this.original[counter].frag = img_data;

        for(let f = 0; f < this.fragments.length; f++)
        {
          if(this.fragments[f].frag === img_data)
          {
            this.fragments[f].frag = img_data;
            break;
          }
        }
        counter++;
      }
    }
  }


  draw()
  {
    console.log(this.show_original);
    if(this.show_original === true)
    {
      for(let i = 0; i < this.original.length; i++)
      {
        c.putImageData(this.original[i].frag, this.original[i].row * this.tW, this.original[i].column * this.tH);
      }
    } 
    else
    {
      for(let i = 0; i < this.fragments.length; i++)
      {
        c.putImageData(this.fragments[i].frag, this.fragments[i].row * this.tW, this.fragments[i].column * this.tH);
      }
    }
  }

  jumble()
  {
    if(this.uploaded_files.length == 0) return;
    if(this.fragments.length == 0) return;

    let check = window.confirm('reset the current game?');
    if(check === false) return;

    let temp = [];
    let tempImg = [];

    for(let i = 0; i < this.total; i++) temp.push(i);

    for(let i = 0; i < ROWS.value; i++)
    {
      for(let p = 0; p < COLUMNS.value; p++)
      {
        let rndImg = Math.floor(Math.random() * temp.length);
        tempImg.push(this.fragments[temp[rndImg]].frag);
        temp.splice(rndImg, 1);
      }
    }
    for(let i = 0; i < tempImg.length; i++)
    {
      this.fragments[i].frag = tempImg[i];
      c.putImageData(this.fragments[i].frag, this.fragments[i].row * this.tW, this.fragments[i].column * this.tH);
    }
    
    this.show_original = false;
    ORIGINAL.style.transform = '';
    this.complete();
  }

  is_original()
  {
    if(this.uploaded_files.length == 0) return;
    this.show_original = !this.show_original;
    if(this.show_original === true) ORIGINAL.style.transform = 'rotate(90deg)';
    else ORIGINAL.style.transform = '';
    this.draw();
  }

  complete()
  {
    let score = 0;
    for(let i = 0; i < this.fragments.length; i++)
    {
      if(this.fragments[i].frag === this.original[i].frag) score++;
    }
    let percent = Math.floor(100 / this.fragments.length * score);
    if(isNaN(percent)) percent = 0;
    COMPLETED.innerHTML = percent.toString() + "%";
    if(percent === 100) window.alert('well done xd');
  }

  mouse_down(x, y)
  {
    if(this.show_original === true) return;
    let segX = Math.floor(x / this.tW);
    let segY = Math.floor(y / this.tH);
    this.firstP = segX * COLUMNS.value + segY;
  }

  mouse_up(x, y)
  {
    if(this.show_original === true) return;
    let segX = Math.floor(x / this.tW);
    let segY = Math.floor(y / this.tH);
    this.secondP = segX * COLUMNS.value + segY;
  
    if(this.firstP != this.secondP)
    {
      c.putImageData(this.fragments[this.secondP].frag, this.fragments[this.firstP].row * this.tW, this.fragments[this.firstP].column * this.tH);
      c.putImageData(this.fragments[this.firstP].frag, this.fragments[this.secondP].row * this.tW, this.fragments[this.secondP].column * this.tH);
      let f1 = this.fragments[this.firstP].frag;
      let f2 = this.fragments[this.secondP].frag;
      this.fragments[this.firstP].frag = f2;
      this.fragments[this.secondP].frag = f1;
    }
    this.complete();
  }
}

CANVAS.onmousedown = function(event) {
  event.preventDefault();
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  let rect = CANVAS.getBoundingClientRect();
  let x = event.clientX - rect.left - scrollX;
  let y = event.clientY - rect.top - scrollY;
  window.jumbler.mouse_down(x, y);
};


CANVAS.onmouseup = function(event)
{
  event.preventDefault();
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  let rect = CANVAS.getBoundingClientRect();
  let x = event.clientX - rect.left - scrollX;
  let y = event.clientY - rect.top - scrollY;
  window.jumbler.mouse_up(x, y);
};

CANVAS.ontouchstart = function(event)
{
  event.preventDefault();

  if(event.touches != undefined)
  {
    let rect = CANVAS.getBoundingClientRect();
    let touch = event.touches[0] || event.changedTouches[0];
    let x = touch.pageX - rect.left;
    let y = touch.pageY - rect.top;
    window.jumbler.mouse_down(x, y);
  }
};

CANVAS.ontouchend = function(event)
{
  event.preventDefault();

  if(event.touches != undefined)
  {
    let rect = CANVAS.getBoundingClientRect();
    let touch = event.touches[0] || event.changedTouches[0];
    let x = touch.pageX - rect.left;
    let y = touch.pageY - rect.top;
    window.jumbler.mouse_up(x, y);
  }
};

function start()
{
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
  window.jumbler = new Jumbler();
}

document.addEventListener("DOMContentLoaded", start);