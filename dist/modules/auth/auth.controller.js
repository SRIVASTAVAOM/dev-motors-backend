import { loginUser } from "./auth.service.js";
export const login = async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        if (!employeeId || !password) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and password are required",
            });
        }
        const result = await loginUser({
            employeeId,
            password,
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Login failed";
        return res.status(401).json({
            success: false,
            message,
        });
    }
};
