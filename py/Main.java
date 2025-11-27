import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int f1 = 1, f2 = 1;
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < n; i++) {
            if (i > 0)
                sb.append(",");
            sb.append(f1);

            int f3 = f1 + f2;
            f1 = f2;
            f2 = f3;
        }

        System.out.print(sb.toString());
    }
}
