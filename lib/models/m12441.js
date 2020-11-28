
//	Основи на Компютърната Графика
//	Модел 12441 - Блуждаене по сфера
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12441 = function M12441(room)
{
	MEIRO.Model.apply(this, arguments);

	// повърхност
	this.surface = new MEIRO.Sphere(5);
	this.surface.material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:50,polygonOffset:true,polygonOffsetFactor:1,transparent:true,opacity:0.8});

	this.frame = new MEIRO.Sphere(5);
	this.frame.material = new THREE.MeshPhongMaterial({color:'navy',wireframe:true,transparent:true,opacity:0.15});
	
	// параметри
	this.a = 0;
	this.r = 0.04;
	this.u = 0;
	this.v = 0;
	
	// обекти
	this.objects = [];
	this.n = 50;
	var material = new THREE.MeshPhongMaterial({color:'white'});
	this.objects.push(new MEIRO.Sphere(1));
	this.objects[0].material = material;
	var geometry = new THREE.SphereGeometry(1,6,6);
	for (var i=1; i<this.n; i++)
	{
		var obj = new THREE.Mesh(geometry,material);
		var s = 0.5-i/this.n/2;
		obj.scale.set(s,s,s);
		this.objects.push(obj);
	}
	
	// сглобяване на целия модел
	this.image.add(this.surface,this.frame);
	for (var i=0; i<this.n; i++)
		this.image.add(this.objects[i]);
}

MEIRO.Models.M12441.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12441.DIST = {MIN:20, MAX:30, HEIGHT:0};
MEIRO.Models.M12441.POS = {DIST:30, ROT_X:0.5, ROT_Y:0};
MEIRO.Models.M12441.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12441.prototype.onAnimate = function(time)
{
	for (var i=this.n-1; i>0; i--)
	{
		this.objects[i].position.copy(this.objects[i-1].position);
	}
	
	this.a += THREE.Math.randFloat(-0.3,+0.3);
	
	this.u += this.r*Math.cos(this.a);
	this.v += this.r*Math.sin(this.a);

	var x = 5*Math.cos(this.u)*Math.cos(this.v);
	var y = 5*Math.sin(this.v);
	var z = 5*Math.sin(this.u)*Math.cos(this.v);

	this.objects[0].position.set(x,y,z);

	reanimate();
}



// информатор на модела
MEIRO.Models.M12441.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Блуждаене по сфера</h1>';

	s += '<p>Това движение е реализирано с две параметрични пространства. Първото използва вектор на скоростта с променлива ориентация <em>[r,α]</em>. Получените от това движение координати <em>(u,v) = [u(r,α), u(r,α)]</em> се интерпретират като два ъгъла във второто параметрично пространство &ndash; сферично. И от него се получават крайните декартови координати <em>(x,y,z) = [x(u,v), y(u,v), z(u,v)]</em> на блуждаенето.</p>';
	s += '<p>Подобно блуждаене е полярно-зависимо, понеже има тенденцията често да минава през двата полюса. Защо?</p>';
	
	element.innerHTML = s;
}
