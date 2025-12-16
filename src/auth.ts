import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    // ถ้าจะเชื่อม Database จริงในอนาคต ค่อยเพิ่ม adapter ตรงนี้
})
