# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "three", to: "three.module.js" # https://unpkg.com/three@0.158.0/build/three.module.js
pin "MMDLoader", to: "MMDLoader.js" # from https://unpkg.com/three@0.158.0/examples/jsm/
pin "GLTFLoader", to: "GLTFLoader.js" # from https://unpkg.com/three@0.158.0/examples/jsm/
pin "OBJLoader", to: "OBJLoader.js" # from https://unpkg.com/three@0.158.0/examples/jsm/
pin "MTLLoader", to: "MTLLoader.js" # from https://unpkg.com/three@0.158.0/examples/jsm/
pin "BufferGeometryUtils", to: "utils/BufferGeometryUtils.js" # from https://unpkg.com/three@0.158.0/examples/jsm/

pin "MMDToonShader", to: "shaders/MMDToonShader.js"
pin "TGALoader", to: "loaders/TGALoader.js"
pin "mmdparser", to: "libs/mmdparser.module.js"
