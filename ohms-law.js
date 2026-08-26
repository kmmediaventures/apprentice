document.getElementById("calculateBtn").addEventListener("click", () => {
    let V = parseFloat(document.getElementById("voltage").value);
    let I = parseFloat(document.getElementById("current").value);
    let R = parseFloat(document.getElementById("resistance").value);
    let P = parseFloat(document.getElementById("power").value);

    let known = [!isNaN(V), !isNaN(I), !isNaN(R), !isNaN(P)].filter(x => x).length;

    if (known < 2) {
        document.getElementById("results").innerHTML = `
            <h2>Results</h2>
            <p>Please enter at least <strong>two</strong> values.</p>
        `;
        return;
    }

    // Calculate missing values
    if (isNaN(V)) {
        if (!isNaN(I) && !isNaN(R)) V = I * R;
        else if (!isNaN(P) && !isNaN(I)) V = P / I;
    }

    if (isNaN(I)) {
        if (!isNaN(V) && !isNaN(R)) I = V / R;
        else if (!isNaN(P) && !isNaN(V)) I = P / V;
    }

    if (isNaN(R)) {
        if (!isNaN(V) && !isNaN(I)) R = V / I;
    }

    if (isNaN(P)) {
        if (!isNaN(V) && !isNaN(I)) P = V * I;
    }

    document.getElementById("results").innerHTML = `
        <h2>Results</h2>
        <p><strong>Voltage (V):</strong> ${V.toFixed(2)} V</p>
        <p><strong>Current (I):</strong> ${I.toFixed(2)} A</p>
        <p><strong>Resistance (R):</strong> ${R.toFixed(2)} Ω</p>
        <p><strong>Power (P):</strong> ${P.toFixed(2)} W</p>
    `;
});
