const logs = [];

console.log = (...args)=>{
    parent.postMessage(
        {
            type:"log",
            data:args
        },
        "*"
    );
};

