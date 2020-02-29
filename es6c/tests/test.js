var println = (str) => console.log(str)

var p = () =>
    (println('hello world'));
p();
var f = (x, y) =>
    y * (1 + x);
println(f);
println(f(3, 4));
println(f(2, 5));
println(f(f(3, 5), 6 - 2));
var f2 = (x, y) =>
    ((() => {

        return y * (1 + x);
    })());
println(f2(f2(3, 5), 6 - 2));
println((a =>
    a + 55)(22));
println(((a, b) =>
    b + a)(3, 4));
println((() =>
    4)());
println(((f, x) =>
    (f(x)))(a =>
    1 + a, 7));
println((a =>
    (b =>
        a + b))(5)(7));
var genPlus5 = () =>
    (b =>
        5 + b);
var plus5 = genPlus5();
println(plus5(7));
var genPlusX = x =>
    (b =>
        x + b);
var plus7 = genPlusX(7);
println(plus7(8));
println(((...more) =>
    (count(more)))(1, 2, 3));
println(((...more) =>
    (count(more)))(1));
println(((...more) =>
    (count(more)))());
println(((a, ...more) =>
    (count(more)))(1, 2, 3));
println(((a, ...more) =>
    (count(more)))(1));
println(((a, ...more) =>
    [
        a,
        more
    ])(1, 2, 3));