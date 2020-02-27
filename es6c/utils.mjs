export const snakeToCamel = (str) => {
    if(str.slice(-1) === "?"){
        str = "is" + str.slice(0,1).toUpperCase() + str.slice(1, -1);
    }

    return str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
                    .replace('-', '')
                    .replace('_', '')
)};