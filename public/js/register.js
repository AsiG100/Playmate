function preview_image(event) {
    var reader = new FileReader();
    
    reader.onload = function() {
        var output = document.getElementById('output_image');
        output.src = reader.result;
    }
    
    reader.readAsDataURL(event.target.files[0]);
    document.querySelector('#imageUpload').submit();
}

// add a function that submits both forms (image before the details) asynchronously.
    
