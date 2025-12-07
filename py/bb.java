import java.util.*;

public class bb {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        for (int i = 1; i <= n; i++) {
            int stars = 2 * i - 1; // 第 i 行要印的星星數

            for (int j = 0; j < stars; j++) {
                System.out.print("*");
            }

            if (i < n) { // 最後一行後面不要再多一個換行也可以
                System.out.println();
            }
        }
    }
}
