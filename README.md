# OpenGL Project

## Short description

## Tasks
### GL.1: General tasks
- [x] Open file and see what happens
- [x] Rename files
- [x] Enable "rendering"
- [x] Enable/Disable rotation by pressing "Rotate on/off"
- [x] FPS Counter

### GL.2: Object models
- [x] Draw a cube (z-cube) at (5,0,1) that rotates on its z-axis every 10 seconds.
- [x] Draw a green cube (x-cube) at (5,0,-3) double as big as z-cube that rotates
      on its x-axis every 5 seconds.
- [x] Draw a square pyramide with its base on the xz-plane, with its base center
      at the origin, with x-length = 4 and z-length = 2. The top of the pyramide
      should be at (0,4,0). Make sure the pyramide just like the cubes with "Rotation on/off".
- [x] Draw a red pyramide which is vertically symmetrical to the previous one.
      Make both pyramides touch tips.
- [x] Draw a blue pyramide. It should have 40% the size of the other pyramides.
      It should be positioned on the side of the upper pyramide, with the square side 
      of the blue pyramide touching the triangle side of the upper pyramide.
- [x] Make sure all the pyramides rotate with the world rotation.

### GL.3: Camera model and coordinate systems
- [x] Add x-axis camera
- [x] Add y-axis camera
- [x] Add z-axis camera
- [x] Add a camera based on the original camera which looks at the pyramids touching tips
- [x] Add option to set camera's opening angle
- [x] Add option to set camera's near clipping plane's distance to 15
- [x] Change aspect ratio to 16:9 in the camera's inner parameters. Why does the browser still show it as 1:1? -> Viewport and aspect ratio also need to be changed

### GL.4: Lighting calculations with vertex shader
- [x] Change the small cube so its color is processed by the CPU and not the shader. (lighting = false)
- [x] Change the small cube so two opposite sides are black and the rest is red. Why are the corners hard to see? (since there is no lighting, there is no change to the color between neighbouring faces of the cube)
- [x] Define and pass the required variables for ambient light (vec4 for ambient intensity, connected to an html slider)
- [ ] Define and pass the required variables for specular light (float for shininess, connected to an html slider)
- [x] Apply ambient light to the shader
- [ ] Apply specular light to the shader
- 

### GL.5: Rasterisation and Texturing
- [ ] Add the hsrm.gif texture to the html page
- [ ] Import the hsrm.gif texture so it can be used by OpenGL
- [ ] 


### TODO / Optimizations:
- [ ] Pass the light position and other static values to the shader once outside of render loop instead of during each frame.
