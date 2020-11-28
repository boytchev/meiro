
//	Основи на Компютърната Графика
//	Модел 10391 - Направа на люспа от Pringles
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10391 = function M10391(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-6,6],[0,3],[-6,6]);
	
	// люспа
	this.k = 0;
	var geometry = new THREE.ParametricGeometry(this.calculate,30,8);
	var material = new THREE.MeshBasicMaterial({color:'red',wireframe:true});
	this.pringle = new THREE.Mesh(geometry,material);

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123.png');
	this.toggle.state = 0;
	this.toggle.stateTexts = ['СТЪПКА №1','СТЪПКА №2','СТЪПКА №3'];
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.pringle);
}

MEIRO.Models.M10391.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10391.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M10391.POS = {DIST:15, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M10391.ROT_Y = {MIN:-0.1, MAX:0.7};


// генератор на модела
MEIRO.Models.M10391.prototype.calculate = function(u,v,k)
{
	k = k||0;
	
	var R = v;
	var a = (2*Math.PI)*(u+v/8);
	
	var t = THREE.Math.clamp(k,0,1);
	var x = THREE.Math.lerp(1,4,t)*R*Math.cos(a);
	var z = THREE.Math.lerp(1,3,t)*R*Math.sin(a);

	var t = THREE.Math.clamp(k,1,2)-1;
	var y = t*(x*x/16-z*z/9);
	return new THREE.Vector3(x,y,z);
}


// генератор на модела
MEIRO.Models.M10391.prototype.recalculate = function(k)
{
	this.k = k;
	
	var i=0;
	var vert = this.pringle.geometry.vertices;

	vert[i++].copy(this.calculate(0,0,k));
	
	for (vi=1; vi<=8; vi++)
	for (ui=0; ui<30; ui++)
	{
		var u = ui/30;
		var v = vi/8;
		vert[i++].copy(this.calculate(u,v,k));
	}
	
	this.pringle.geometry.verticesNeedUpdate = true;
}


// аниматор на модела
MEIRO.Models.M10391.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M10391.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Направа на люспа от Pringles</h1>';

	s += '<p>Създаването на параметричен обект, какъвто е люспата от Pringles може да използва директна формула, но често е по-удобно да разделим създаването на няколко по-прости стъпки. Уравненията на преходите между съседни стъпки са по-леки и по-ясни.</p>';
	s += '<p>Конкретно в този модел стъпките са:<ul>';
	s += '<li>Започваме с единична окръжност.</li>';
	s += '<li>Изпъваме окръжността до елипса.</li>';
	s += '<li>Извиваме елипсата до хиперболичен параболоид.</li></ul></p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M10391.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);

	var that = this;
	var from = {k:that.k};
	var to = {k:this.toggle.state};

	new TWEEN.Tween(from)
		.to(to,1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.recalculate(this.k)})
		.start();
	
	reanimate();
}
