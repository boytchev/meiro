
//	Основи на Компютърната Графика
//	Модел 09223 - Тримерен текст в ThreeJS
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09223 = function M09223(room)
{
	MEIRO.Model.apply(this, arguments);

	// тяло
	var string = 'абвгдеж';
	this.letters = [];
	for (var i=0; i<7; i++)
	{
		var ch = new MEIRO.Text(string[i]);
		ch.position.x = 1.5*(i-1);
		ch.scale.set(2,2,2);
		ch.material = new THREE.MeshNormalMaterial();
		this.letters.push(ch);
	}

	// сглобяване на целия модел
	for (var i=0; i<7; i++)
		this.image.add(this.letters[i]);
}

MEIRO.Models.M09223.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09223.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09223.POS = {DIST:10, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M09223.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09223.prototype.onAnimate = function(time)
{
	for (var i=0; i<7; i++)
	{
		this.letters[i].position.x = 2*Math.sin(rpm(time,2)+i);
		this.letters[i].position.y = 1*Math.sin(rpm(time,2)-i);
		this.letters[i].position.z = 2*Math.cos(rpm(time,2)+i);
		this.letters[i].rotation.x += Math.sin(rpm(time,1)+i)/80;
		this.letters[i].rotation.y += Math.sin(rpm(time,1)-i)/50;
		this.letters[i].rotation.z += Math.cos(rpm(time,1)+i)/80;
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M09223.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Тримерни текстове в ThreeJS</h1>';

	s += '<p>Символите от шрифт могат да бъдат описани с контурите си. Самото създаване на описанието се извършва извън ThreeJS, но на негова базата ThreeJS генерира тримерен текст.</p>';
	
	element.innerHTML = s;
}