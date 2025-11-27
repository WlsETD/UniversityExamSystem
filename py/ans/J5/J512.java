import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i += 2) {
            System.out.print(i);
            if (i + 2 <= n) System.out.print(" ");
        }
    }
}
