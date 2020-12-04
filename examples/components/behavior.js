module.exports = Behavior({
    created() {
        console.log('created');
    },
    data: {
        __log: true,
    }
})