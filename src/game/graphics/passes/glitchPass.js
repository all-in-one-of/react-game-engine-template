import * as THREE from 'three';
import DigitalGlitch from "../shaders/digitalGlitch";
import Pass from "./pass";

/**
 * @author alteredq / http://alteredqualia.com/
 */

const GlitchPass = function ( dt_size ) {

	Pass.call( this );

	if ( DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );

	var shader = DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( dt_size === undefined ) dt_size = 64;


	this.uniforms[ "tDisp" ].value = this.generateHeightmap( dt_size );


	this.material = new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

	this.goWild = false;
	this.curF = 0;
	this.generateTrigger();

};

GlitchPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: GlitchPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ 'seed' ].value = Math.random();//default seeding
		this.uniforms[ 'byp' ].value = 0;

		if ( this.curF % this.randX === 0 || this.goWild === true ) {

			this.uniforms[ 'amount' ].value = Math.random() / 30;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.curF = 0;
			this.generateTrigger();

		} else if ( this.curF % this.randX < this.randX / 5 ) {

			this.uniforms[ 'amount' ].value = Math.random() / 90;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );

		} else if ( this.goWild === false ) {

			this.uniforms[ 'byp' ].value = 1;

		}

		this.curF ++;
		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	generateTrigger: function() {

		this.randX = THREE.Math.randInt( 120, 240 );

	},

	generateHeightmap: function( dt_size ) {

		var data_arr = new Float32Array( dt_size * dt_size * 3 );
		var length = dt_size * dt_size;

		for ( var i = 0; i < length; i ++ ) {

			var val = THREE.Math.randFloat( 0, 1 );
			data_arr[ i * 3 + 0 ] = val;
			data_arr[ i * 3 + 1 ] = val;
			data_arr[ i * 3 + 2 ] = val;

		}

		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		texture.needsUpdate = true;
		return texture;

	}

} );

export default GlitchPass;