
//	Основи на Компютърната Графика
//	Модел 27201 - Сгъстена изкуствена мъгла
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M27201 = function M27201(room)
{
	MEIRO.Model.apply(this, arguments);

	var box = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE);
	box.scale.set(5,5,5);
	box = new THREE.BoxHelper(box,'black');

	var n = 50;
	var alpha = 1/n;
	
	this.artificialFog = [];
	var geometry = new THREE.PlaneGeometry(5,5);
	var material = new THREE.MeshBasicMaterial({color:'navy',side:THREE.DoubleSide,transparent:true,opacity:alpha});
	for (var i=0; i<n; i++)
	{
		var f = new THREE.Mesh(geometry,material);
		f.position.z = 5*(i/(n-1)-0.5);
		this.artificialFog.push( f );
	}

	// сглобяване на целия модел
	this.image.add(box);
	for (var i=0; i<n; i++)
		this.image.add( this.artificialFog[i] );
}

MEIRO.Models.M27201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M27201.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M27201.POS = {DIST:10, ROT_X:1, ROT_Y:0.4};
MEIRO.Models.M27201.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M27201.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M27201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сгъстена изкуствена мъгла</h1>';

	s += '<p>Ефектът на мъглата може да се генерира изкуствено чрез голям брой полупрозрачни плоскости. Моделът показва куб от 50 плоскости, всяка от които е с 2% прозрачност. Степента на замъгленост зависи и от гледната точка. Ако гледаме плоскостите странично, то ефектът се намалява.</p>';
	
	element.innerHTML = s;
}