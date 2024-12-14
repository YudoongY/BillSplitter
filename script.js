const form = document.getElementById('splitForm');
const peopleContainer = document.getElementById('peopleContainer');

// 添加参与者
function addPerson() {
    const div = document.createElement('div');
    div.innerHTML = `Name: <input type="text" name="name[]" required /> 花费: <input type="number" name="expense[]" required />`;
    peopleContainer.appendChild(div);
}

// 处理表单提交
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const names = Array.from(document.getElementsByName('name[]')).map(i => i.value);
    const expenses = Array.from(document.getElementsByName('expense[]')).map(i => parseFloat(i.value));

    const people = names.map((name, idx) => ({ name, expense: expenses[idx] }));

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    // 分摊计算逻辑
    const num = people.length;
    const total = people.reduce((acc, p) => acc + p.expense, 0);
    const avg = total / num;

    // 每个人应收应付：若 expense - avg > 0 表示多付出，需要收钱；<0 表示应付款
    const balance = people.map(p => ({
        name: p.name,
        diff: p.expense - avg
    }));

    let owes = balance.filter(b => b.diff < 0).map(b => ({ ...b, diff: Math.abs(b.diff) }));
    let owesTo = balance.filter(b => b.diff > 0);

    const transactions = [];

    // 匹配付钱和收钱的人
    for (let o of owes) {
        while (o.diff > 0) {
            let receiver = owesTo[0];
            let amount = Math.min(o.diff, receiver.diff);
            transactions.push({ from: o.name, to: receiver.name, amount });
            o.diff -= amount;
            receiver.diff -= amount;
            if (receiver.diff === 0) owesTo.shift();
        }
    }

    // 显示结果
    if (transactions.length === 0) {
        resultDiv.innerHTML = 'All debts are settled!';
    } else {
        transactions.forEach(t => {
            const p = document.createElement('p');
            p.textContent = `${t.from} Should pay ${t.to} ${t.amount.toFixed(2)}dollars`;
            resultDiv.appendChild(p);
        });
    }
});
