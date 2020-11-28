
//	Основи на Компютърната Графика
//	Модел 26331 - Крива на Безие като преход между точки
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26331 = function M26331(room)
{
	MEIRO.Model.apply(this, arguments);

	this.map = [];
	this.map.push( new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAABACAMAAABbYT+NAAAAbFBMVEWAgP8EBAkGBgxAQH8CAgUAAAAQEB8sLFddXbohIUFOTpt+fvxUVKhERIgLCxUXFy4vL15VVakjI0ZlZcr///8AAAAHBw0JCRGZmcuRkcTu7v2AgKsCAgOfn9MFBQoQECCHh7aTk8dSUnQ1NVngssBlAAAAFHRSTlOz+/rT/fjy38Pmy7TH0fft3Mfkv6sE/j8AAAH8SURBVHja7d3LTsMwEEbh2JiEa9pCxw6QSwvv/4648oJISFX/gFBFz9mPOnW/rqe6tll9zkv13gUvl2eC80ohb/a1Y1KKfRrHJJdn+piU+vmOwZeUB5HLM+rvlbNZ1wXAPCfl69Y7vbZutYHe5kWllKYpLmiaUpSyeb3+IHq+rcXXt9wRAHqh9bYg3zr7s8Yp2YLSNNqf5Za+Y7Af9A3A6rF0dXI+5KErscfGnK2VgUNN2fGj67phGPYvJ7bfjdHeh05seLc47vYvJ9cdPuKj7Nioz7g2Z43+jisLXho4tDoC4KlSq4OtK7kbc/asDm3KjrutWoo2bOUGi0ke2pUdN5XYszm7qeTWFmp56OkIgNtK7D4DaCq5zZLve1d2fNuKvWYAnQ6gywBe1aG3suPdkn/EppJrMoB7dej2DAA8AOA7gAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgadTFHozgbd+Fn4zgceeGHI9U4Hfs7nc3pWLN/eDw6cjz6yPFozsdf+Pn4T+IgdES47/2sAAAAAElFTkSuQmCC') );
	this.map.push( new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAABACAMAAABbYT+NAAAAkFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAGBgsCAgQQEB8LCxYBAQIAAAAZGTFTU6UpKVMkJEgjI0UeHjxSUqMhIUEoKE8AAAEJCREDAwYVFSoAAAA7O3caGjMAAABnZ89MTJgSEiQCAgQAAACAgP8AAAB+fvtmZssaGjR6evNkZMdUVKdqatNoaM9ZWbJQUKB8fPd4eO8OFh6WAAAAInRSTlMAINvzv0Db1+Pb1OD1+fjs5trz4PL76v37AfzPJunox6ZGOhPMwwAAAmZJREFUeNrt3etW4jAUBWDSJKJkBC8DXmfUEExpQd7/7bSprZDFWjH+qufs7xn22qeU5HS0jIyAtGUEAWAGAWAOAWAOAWAOAWAOAfjVRAMBYEsoYwqlhUAAeBJmebOQRcgAAsCQUPPF/fT0pM0AAsCPLib/y3I9OxvLUAMIADNCyafVm6/K8+vPGhAIACtNBeysc75e96MAAWCkqYCNt9Y6X+2NAgSADa3krHb2g3MHowABYEIXJ2tvg2gUIAAsCCUvamdb8ShAABjQxbivgCOjAAGgTih53VXA0VGAABCni8m5twfiUYAAUCaUvOwqIDUK8gNwN4KhiyogMQoyA/AoYOi0kQ+Vs0FiFOQHwBQweHP5/K8LQGoU5Abg5vYVBm+68baTHAV5AbjdlisYusrbXtYoSAfgT/nmYPDsl7xRkA7Aylkg4nAUIAAcRaPgDgFg52AUPCIAHPWjwBgEgKmmBrYzuUQAmHJuV2/uF3MEgKXwKHhxNp5jBDAUngD+no6bp8AXBICZ8Bvg6rJ7HYSfgbx8Vv+kfQuAV8F05Fa/FvgziJLKZ1Y//g6mZbrxGdWPAyHUfB0ISVc/joTR0x8JS1c/DoVSpIvJlf9G9eNYOE1CyYfapaof9wLICgWQqH5cDKEruhdypPpxNYy06FpIVP24HEpdVABR9eN6OHkfBbD2x6sfCyIY6C6Hx9WPFTFMdBtiourHkigm2gUxUfVjTRwfTQHs9qsfiyJZaZbElfVe9WNVLCthWfS2r34si+YmrItvqx/r4jkSypi2+vHBCJ5EgE/GAAIACAAgAIAAAAIAPw/AO4GjdYhQh91xAAAAAElFTkSuQmCC') );
	this.map[0].anisotropy = 16;
	this.map[1].anisotropy = 16;

	
	// пръстени, линии и блокове
	this.object = new MEIRO.Bezier3D(3);
	this.object.material = new THREE.MeshBasicMaterial({map:this.map[0],side:THREE.DoubleSide,transparent:true,premultipliedAlpha:true,side:THREE.DoubleSide});
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Смяна', 'images/toggle.png');
	this.toggle.state = 0;
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.object);
}

MEIRO.Models.M26331.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26331.DIST = {MIN:20, MAX:60, HEIGHT:0};
MEIRO.Models.M26331.POS = {DIST:30, ROT_X:1.4, ROT_Y:0.2};
MEIRO.Models.M26331.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26331.prototype.onAnimate = function(time)
{	
	var n = 12;
	
	var y1 = 3*Math.sin(rpm(time,10));
	var y2 = 5*Math.cos(rpm(time,13));
	var y3 = 3*Math.sin(rpm(time,14));
	
	var v = new THREE.Vector2(-y2+y1,n).normalize();
	var z = 0;
	
	this.object.surface.controlPoints[0][0].set(-n-v.x,y1-v.y,z);
	this.object.surface.controlPoints[0][1].set(-n,y1,z);
	this.object.surface.controlPoints[0][2].set(-n+v.x,y1+v.y,z);
	
	this.object.surface.controlPoints[1][0].set(0,y2-1,z);
	this.object.surface.controlPoints[1][1].set(0,y2,z);
	this.object.surface.controlPoints[1][2].set(0,y2+1,z);
	
	var v = new THREE.Vector2(-y3+y2,n).normalize();

	this.object.surface.controlPoints[2][0].set(n-v.x,y3-v.y,z);
	this.object.surface.controlPoints[2][1].set(n,y3,z);
	this.object.surface.controlPoints[2][2].set(n+v.x,y3+v.y,z);
	
	this.object.recalculate();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M26331.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Крива на Безие като преход между точки</h1>';

	s += '<p>Кривата на Безие може да се разглежда като плавен преход от една точка към друга точка. Преходът се контролира от една или повече междинни контролни точки.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M26331.prototype.onToggle = function(element)
{
	this.toggle.state = 1-this.toggle.state;
	this.object.material.map = this.map[this.toggle.state];
	reanimate();
}
