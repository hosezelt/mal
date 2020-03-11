println(_equal(1, 1));
println(_equal(1, 2));
println(_equal(1, '1'));
println(_equal('abc', 'abc'));
println(_equal('abc', 'abcd'));
println(_equal('abc', 'abd'));
println(_equal('abc', 'abc'));
println(_equal('ʞabc', 'abc'));
println(_equal('abc', 'abc'));
println(_equal('ʞabc', 'ʞabc'));
println(_equal(list(), list()));
println(_equal(list(1, 2), list(1, 2)));
println(_equal(list(1), list()));
println(_equal(list(), list(1)));
println(_equal(0, list()));
println(_equal(list(), 0));
println(_equal(list(), ''));
println(_equal('', list()));
println(_equal([], list()));
println(_equal([
    7,
    8
], [
    7,
    8
]));
println(_equal(list(1, 2), [
    1,
    2
]));
println(_equal(list(1), []));
println(_equal([], [1]));
println(_equal(0, []));
println(_equal([], 0));
println(_equal([], ''));
println(_equal('', []));
println(_equal([list()], list([])));
println(_equal([
    1,
    2,
    list(3, 4, [
        5,
        6
    ])
], list(1, 2, [
    3,
    4,
    list(5, 6)
])));