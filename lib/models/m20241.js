
//	Основи на Компютърната Графика
//	Модел 20241 - Плавен преход на гледна точка
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M20241 = function M20241(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.oxyz = new MEIRO.Axes3D([-5,5],[-1,2],[-5,5]);

	this.eye = new THREE.Object3D();
	this.eye.position.set(0,0,13);

	controls.userUp = new THREE.Vector3(1,0,0);
	controls.userTarget = this.oxyz.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	
	// цифри
	this.focus = 1;
	this.digits = [];
	for (var i=0; i<10; i++)
	{
		var digit = new MEIRO.Label(i,1,-0.5,-0.5,0);
		digit.alpha = THREE.Math.randFloat(0,2*Math.PI);
		digit.position.set(THREE.Math.randFloat(-4,4),0,THREE.Math.randFloat(-4,4));
		digit.rotation.set(-Math.PI/2,digit.alpha,0,'YXZ');
		digit.scale.set(1,1,20);
		digit.material = new THREE.MeshLambertMaterial({color:'cornflowerblue'});
		this.digits.push(digit);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ 1', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxyz,this.eye);
	for (var i=0; i<10; i++)
		this.image.add(this.digits[i]);
}

MEIRO.Models.M20241.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M20241.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M20241.POS = {DIST:15, ROT_X:0.57, ROT_Y:0.3};
MEIRO.Models.M20241.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M20241.prototype.onAnimate = function(time)
{
	for (var i=0; i<10; i++)
	{
		this.digits[i].alpha += 0.02*Math.sin(rpm(time,4)+i);
		this.digits[i].rotation.y = this.digits[i].alpha;
		this.digits[i].position.x = 4*Math.sin(rpm(time,4)+i*i);
		this.digits[i].position.z = 4*Math.cos(rpm(time,5)-i);
	}
	
	this.eye.position.copy(this.digits[this.focus].position);
	this.eye.position.y = 3;
	controls.userTarget.copy(this.digits[this.focus].getWorldPosition());
	controls.userPosition.copy(this.eye.getWorldPosition());
	controls.userUp.set(-Math.sin(this.digits[this.focus].alpha),0,-Math.cos(this.digits[this.focus].alpha));

	
	TWEEN.update();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M20241.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Плавен преход на гледна точка</h1>';

	s += '<p>Всяка гледна точка може да се представи чрез 3 вектора. Затова преходът между две гледни точки се реализира като преход между трите вектора от едната гледна точка и съответните три вектора от другата.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M20241.prototype.onToggle = function(element)
{	
	var that = this;
	new TWEEN.Tween({k:controls.userLERP})
		.to({k:controls.userLERP>0.5?0:1},2500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			controls.userLERP = this.k;
		} )
		.onComplete( function(){
			if (this.k==0)
			{
				that.focus = (that.focus+1)%10;
				that.toggle.setText('ВИЖ '+that.focus);
			}
		} )
		.start();	
	reanimate();
}


MEIRO.Models.M20241.prototype.onEnter = function()
{
	controls.userCamera = true;
	controls.userLERP = 0;
	controls.userUp = new THREE.Vector3(1,0,0);
	controls.userTarget = this.oxyz.getWorldPosition();
	controls.userPosition = this.eye.getWorldPosition();
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M20241.prototype.onExit = function()
{
	controls.userCamera = false;
	MEIRO.Model.prototype.onExit.call(this);
}
