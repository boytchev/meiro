
//	Основи на Компютърната Графика
//	Модел 27091 - Прозрачност чрез α-компонента
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M27091 = function M27091(room)
{
	MEIRO.Model.apply(this, arguments);

	var geometry = new THREE.PlaneGeometry(6,3);
	
	this.plate1 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:'red',transparent:true,opacity:0.5,side:THREE.DoubleSide}) );
	this.plate1.renderOrder = 1;
	this.plate1.position.z = -1;
	this.frame1 = new THREE.BoxHelper( this.plate1, 'black' );
	
	this.plate2 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:'blue',transparent:true,opacity:0.5,side:THREE.DoubleSide}) );
	this.plate2.renderOrder = 2;
	this.plate2.position.z = 1;
	this.frame2 = new THREE.BoxHelper( this.plate2, 'black' );

	this.object3 = new MEIRO.Cube();
	this.object3.material = new THREE.MeshBasicMaterial({color:'moccasin',transparent:true,opacity:1});
	this.object3.scale.set(1,1/3,2);
	this.frame3 = new THREE.BoxHelper( this.object3, 'black' );

	this.object4 = new MEIRO.Cube();
	this.object4.material = this.object3.material
	this.object4.scale.set(1,1/3,4);
	this.object4.position.z = 3
	this.frame4 = new THREE.BoxHelper( this.object4, 'black' );

	this.object5 = new MEIRO.Cube();
	this.object5.material = this.object3.material
	this.object5.scale.set(1,1/3,4);
	this.object5.position.z = -3
	this.frame5 = new THREE.BoxHelper( this.object5, 'black' );
	
	// сглобяване на целия модел
	this.image.add(this.plate1,this.plate2,this.object3,this.object4,this.object5,this.frame1,this.frame2,this.frame3,this.frame4,this.frame5);
}

MEIRO.Models.M27091.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M27091.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M27091.POS = {DIST:10, ROT_X:1, ROT_Y:0.5};
MEIRO.Models.M27091.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M27091.prototype.onAnimate = function(time)
{
	this.plate1.material.opacity = 0.5+0.2*THREE.Math.clamp(1.5*Math.sin(rpm(time,5)),-1,1);
	this.plate2.material.opacity = 1-this.plate1.material.opacity;
	reanimate();
}



// информатор на модела
MEIRO.Models.M27091.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Прозрачност чрез α-компонента</h1>';

	s += '<p>Прозрачност може да се представи с разширение на цветовете. Например, трикомпонентния <em>RGB</em> цвят се разширява с компонента за прозрачност до <em>RGBα</em>. Използването на такава прозрачност изисква примитивите да се рисуват в строго определен ред, в зависимост от тяхното положение и от това дали са полупрозрачни (0<α<1) или изцяло плътни (α=1).</p>';
	
	element.innerHTML = s;
}