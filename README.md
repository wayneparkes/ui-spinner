ui-spinner
==========

A core JavaScript ui spinner (PNG Sprite)

#### Implentation

Statically by adding configurations to the invoking script tag
```html
<script src="js/spinner.js" 
	data-image="content/images/spinner.png" 
	data-time="750"
	data-position="left">
</script>
```

Dynamically by instantiating one when required...
```javascript
spinner.create(domElement, {
  'image' : 'content/images/spinner.png',
  'time' : 750,
  'position' : 'left'
});
```
...and then controlling it via its host domElement
```javascript
domElement.spinner.start();
```

#### Example
http://ui.developedby.me/spinner/
