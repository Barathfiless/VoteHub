


async function testGetDepartments() {
    try {
        console.log('Fetching Departments...');
        const response = await fetch('http://localhost:5000/api/departments');
        const data = await response.json();
        console.log('Departments:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testGetDepartments();
