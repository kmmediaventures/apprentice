// Conductor areas (square inches)
const conductorAreas = {
    "14": 0.0130,
    "12": 0.0133,
    "10": 0.0211,
    "8": 0.0366,
    "6": 0.0507,
    "4": 0.0824,
    "2": 0.1158,
    "1/0": 0.1855,
    "2/0": 0.2223,
    "3/0": 0.2679,
    "4/0": 0.3237
};

// Conduit areas (square inches)
const conduitAreas = {
    emt: {
        "0.5": 0.304,
        "0.75": 0.533,
        "1": 0.864,
        "1.25": 1.496,
        "1.5": 2.036,
        "2": 3.356
    },
    pvc40: {
        "0.5": 0.302,
        "0.75": 0.533,
        "1": 0.864,
        "1.25": 1.496,
        "1.5": 2.036,
        "2": 3.356
    },
    pvc80: {
        "0.5": 0.284,
        "0.75": 0.495,
        "1": 0.824,
        "1.25": 1.442,
        "1.5": 1.980,
        "2": 3.146
    }
};

// NEC fill limits
function getFillLimit(count) {
    if (count === 1) return 53;
    if (count === 2) return 31;
    return 40;
}

document.getElementById("calculateBtn").addEventListener("click", () => {
    const type = document.getElementById("conduitType").value;
    const size = document.getElementById("conduitSize").value;
    const gauge = document.getElementById("wireGauge").value;
    const count = parseInt(document.getElementById("wireCount").value);

    const conductorArea = conductorAreas[gauge];
    const conduitArea = conduitAreas[type][size];

    const totalArea = conductorArea * count;
    const fillPercent = (totalArea / conduitArea) * 100;
    const limit = getFillLimit(count);

    let status = fillPercent <= limit ? "PASS ✔" : "FAIL ✖";
    let color = fillPercent <= limit ? "green" : "red";

    document.getElementById("results").innerHTML = `
        <h2>Results</h2>
        <p><strong>Conduit:</strong> ${type.toUpperCase()} ${size}"</p>
        <p><strong>Wire:</strong> #${gauge} × ${count}</p>
        <p><strong>Fill:</strong> ${fillPercent.toFixed(2)}%</p>
        <p><strong>NEC Limit:</strong> ${limit}%</p>
        <p style="color:${color}; font-size:1.4em;"><strong>${status}</strong></p>
    `;
});
