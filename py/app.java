import java.util.*;

public class app {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next();
        int count = 0;
        char current = a.charAt(0);
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < a.length(); i++) {
            char c = a.charAt(i);
            if (c == current) {
                count += 1;
                sb.append(current);
                sb.append(count);
            }
        }
    }
}
