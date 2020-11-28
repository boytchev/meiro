
//	Основи на Компютърната Графика
//	Модел 12101 - Илюзия с въртящи се сфери
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12101 = function M12101(room)
{
	MEIRO.Model.apply(this, arguments);

	// цветове
	this.k = 0;
	this.oldTime = 0;
	this.angle = 0;
	this.black = new THREE.Color('black');
	this.colors = [
		new THREE.Color('cornflowerblue'),
		new THREE.Color('cornflowerblue'),
		new THREE.Color('tomato'),
		new THREE.Color('tomato'),
		new THREE.Color('lime'),
		new THREE.Color('lime') ];
		
	// сфери
	this.sphere = [];
		
	for (var i=0; i<6; i++)
	{
		var s = new MEIRO.Sphere(1);
		s.material = new THREE.MeshPhongMaterial({color:'black',shininess:150});
		this.sphere.push(s);
	}
	
	// светлини
	light1 = new THREE.PointLight('white',2/3);
	light1.position.set(5,15,5);
	light2 = new THREE.PointLight('white',2/3);
	light2.position.set(-5,15,5);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ПОДСКАЗКА', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	for (var i=0; i<6; i++)
		this.image.add(this.sphere[i]);
	this.image.add(light1,light2);
}

MEIRO.Models.M12101.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12101.DIST = {MIN:5, MAX:25, HEIGHT:0};
MEIRO.Models.M12101.POS = {DIST:10, ROT_X:0, ROT_Y:0};
MEIRO.Models.M12101.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12101.prototype.onAnimate = function(time)
{
	var dTime = time-this.oldTime;
	this.oldTime = time;
	
	this.angle += 0.005*dTime*(1-0.9*this.k);

	var sin = 1.7*Math.sin(this.angle);
	var cos = 1.7*Math.cos(this.angle);
	
	this.sphere[0].position.set(+cos,+sin,0);
	this.sphere[1].position.set(-cos,-sin,0);

	this.sphere[2].position.set(0,+cos,+sin);
	this.sphere[3].position.set(0,-cos,-sin);
	
	this.sphere[4].position.set(+sin,0,+cos);
	this.sphere[5].position.set(-sin,0,-cos);

	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M12101.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Илюзия с въртящи се сфери</h1>';

	s += '<p>Шест сфери се въртят около общ център. Ако движението е достатъчно бързо и ако сферите са едноцветни, тогава е трудно да се прецени дали има момент във времето, в който поне една от сферите не се докосва до никоя от другите. Двата начина да се разбере е или да се забави въртенето, или да се пресметне траекторията на всяка сфера и дали наистина се докосва до някоя друга.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M12101.prototype.onToggle = function(element)
{
	var that = this;
	var from = {k:that.k};
	var to = {k:that.k>0.5?0:1};

	new TWEEN.Tween(from)
		.to(to,500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
				that.k = this.k;
				for (var i=0; i<6; i++)
				{
					that.sphere[i].material.color.set(that.black);
					that.sphere[i].material.color.lerp(that.colors[i],that.k);
				}
			})
		.start();
	
	reanimate();
}
