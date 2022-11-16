export const convertValue = (stateValue: number, data: number) => {
    console.log(stateValue)
    return Object
        .fromEntries(Object
            .entries(data)
            .map(([key, value]) => [key, Math.round(value * 100) / 100 * stateValue]));
}