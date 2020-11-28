
//	Основи на Компютърната Графика
//	Модел 28571 - Матовост и гланцовост
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28571 = function M28571(room)
{
	MEIRO.Model.apply(this, arguments);

	this.ball = [];
	for (var i=0; i<4; i++)
	{
		this.ball.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE,
			new THREE.MeshPhongMaterial({color:0x202020,shininess:5*Math.pow(3.6,i)})) );
		this.ball[i].position.z = 2.2*(i-1.5);
	}
		
	var hemi = new THREE.HemisphereLight('blue','yellow',3);
	
	this.defaultLight.intensity = 0;
	
	this.n = 6;
	this.light = [];
	var colors = ['gold','violet','lime','blue','red','white'];
	for (var i=0; i<6; i++)
	{
		this.light.push( new THREE.DirectionalLight(colors[i],2) );
		var a = 2*Math.PI*i/6;
		this.light[i].position.set(
			2*Math.sin(a),
			1,
			2*Math.cos(a));
		this.light[i].target = new THREE.Object3D();
	}
	
	// сглобяване на целия модел
	this.image.add(hemi);
	for (var i=0; i<4; i++)
		this.image.add(this.ball[i]);
	for (var i=0; i<6; i++)
	{
		this.image.add(this.light[i]);
		this.image.add(this.light[i].target);
	}
}

MEIRO.Models.M28571.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28571.DIST = {MIN:3, MAX:20, HEIGHT:0};
MEIRO.Models.M28571.POS = {DIST:10, ROT_X:0, ROT_Y:0.3};
MEIRO.Models.M28571.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28571.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M28571.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Матовост и гланцовост</h1>';

	s += '<p>Задаването на подходящи стойности на коефициентите на огледално отразената светлина прави обектът да изглежда с желаната степен на матовост.</p>';
	s += '<p>Колкото тази светлина е по-фокусирана, толкова по-гланцова изглежда повърхността на обекта. И обратното, по-малка степен на фокусираност води до по-матова повърхност.</p>';
	element.innerHTML = s;
}