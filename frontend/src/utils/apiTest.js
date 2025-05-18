/**
 * Công cụ hỗ trợ kiểm tra API
 * Sử dụng trong console browser để test API endpoints
 */

export const testAPI = {
    /**
     * Test API lấy thông tin đề thi theo ID
     * @param {string} testId - ID của đề thi cần lấy
     */
    getTest: async function(testId) {
        try {
            console.log(`Testing API getTest with ID: ${testId}`);
            const response = await fetch(`http://localhost:5000/api/tests/${testId}`);
            console.log(`Response status: ${response.status}`);
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("Response not JSON:", await response.text());
                return;
            }
            
            const data = await response.json();
            console.log("API Response Data:", data);
            return data;
        } catch (error) {
            console.error("API Test Error:", error);
        }
    },

    /**
     * Test tất cả các APIs liên quan đến đề thi
     */
    testAllExamApis: async function() {
        try {
            // Test API lấy danh sách đề thi
            console.log("Testing getAllTests API...");
            const listResponse = await fetch(`http://localhost:5000/api/tests`);
            const listData = await listResponse.json();
            console.log("Test List Result:", listData);
            
            if (listData.tests && listData.tests.length > 0) {
                // Test API lấy chi tiết đề thi đầu tiên trong danh sách
                const firstTestId = listData.tests[0]._id;
                console.log(`Testing getTestById API with ID: ${firstTestId}`);
                await this.getTest(firstTestId);
            }
        } catch (error) {
            console.error("API Test Error:", error);
        }
    }
};

// Thêm công cụ để sử dụng trong console
window.testAPI = testAPI;

console.log("API Test Utils loaded. Use window.testAPI to test API endpoints.");
