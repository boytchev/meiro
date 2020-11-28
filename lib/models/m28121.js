
//	Основи на Компютърната Графика
//	Модел 28121 - Дистанционно тониране
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M28121 = function M28121(room)
{
	MEIRO.Model.apply(this, arguments);

	this.image.fog = new THREE.Fog('black',1,2);
	
	var n = 6;
	var k = 2;
	
	this.buildings = [];
	this.material = new THREE.MeshLambertMaterial({color:new THREE.Color(100/255,149/255,237/255)});
	for (var x=-n; x<=n; x++) 
	for (var z=-n; z<=n; z++)
	{	
		var b = new MEIRO.Cube(1);
		b.material = this.material;
		b.offset = 2*Math.PI*Math.random();
		b.speed = 0.5+Math.PI*Math.random();
		b.position.set(k*x,0,k*z);
		b.scale.set(k,1,k);
		this.buildings.push(b);
	}

	// бутон за превключване
	var that = this;
	this.shade = 0;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Затъмни', 'images/show.hide.png');
	this.toggle.hide();

	// сглобяване на целия модел
	for (var i=0; i<this.buildings.length; i++)
		this.image.add(this.buildings[i]);
}

MEIRO.Models.M28121.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28121.DIST = {MIN:30, MAX:70, HEIGHT:-7};
MEIRO.Models.M28121.POS = {DIST:50, ROT_X:0.5, ROT_Y:0.7};
MEIRO.Models.M28121.ROT_Y = {MIN:0.3, MAX:1.5};


// аниматор на модела
MEIRO.Models.M28121.prototype.onAnimate = function(time)
{
	if (controls.dist && this.shade)
	{	
		this.image.fog.near = controls.dist/2;
		this.image.fog.far = controls.dist+0.4;
	}
	else
	{	
		this.image.fog.near = 100;
		this.image.fog.far = 1000;
	}
	
	for (var i=0; i<this.buildings.length; i++)
	{
		var b = this.buildings[i];
		var h = 10+8*Math.sin(rpm(time,5*b.speed)+b.offset);
		b.position.y = h/2;
		b.scale.y = h;
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M28121.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Дистанционно тониране</h1>';

	s += '<p>При дистанционно тониране се симулира ефекта на отслабване на осветеността при отдалечаване от светлинния изтичник. По този начин обектите, които са по-отдалечени, изглеждат по-тъмни.</p>';
	
	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M28121.prototype.onToggle = function(element)
{
	this.shade = 1-this.shade;
	if (this.shade)
		this.material.color.setRGB(100/130,149/130,237/130);
	else
		this.material.color.setRGB(100/255,149/255,237/255);
}
