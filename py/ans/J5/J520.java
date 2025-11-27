import java.util.Scanner;

public class J520 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long f = 1;
        for (int i = 1; i <= n; i++) {
            f *= i;
            System.out.print(f);
            if (i < n)
                System.out.print(" ");
        }
    }
}
