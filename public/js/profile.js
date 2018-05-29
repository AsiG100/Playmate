function getAge(dateString) {
    var today = Date.now();
    var birthDate = Date.parse(dateString);
    var oneYear = 1000 * 60 * 60 * 24 * 365;
    var age = (today - birthDate)/oneYear;
    return age;
}

