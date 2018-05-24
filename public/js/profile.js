function getAge(dateString) {
    var today = Date.now();
    var birthDate = Date.parse(dateString);
    var oneYear = 1000 * 60 * 60 * 24 * 365;
    console.log(today,' ',birthDate);
    var age = (today - birthDate)/oneYear;
    console.log(age);
    return age;
}

